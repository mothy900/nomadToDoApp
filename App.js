import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  placeholder,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { theme } from "./color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import { roundToNearestPixel } from "react-native/Libraries/Utilities/PixelRatio";
const STORAGE_KEY = "@toDos";
const STATE_KEY = "@working";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [text, setText] = useState("");
  const [done, setDone] = useState("false");
  const [editKey, setEditKey] = useState(false);
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({}); //여기에 Array를 넣기도 하지만 이번 프로젝트에선 hashmap 을 만들것

  useEffect(() => {
    // 화면 켜지자마자 실행
    loadToDos();
    setLoading(false);
  }, []);
  useEffect(() => {
    console.log("useEffect");
  }, [done]);
  const saveWorking = async (satate) => {
    const w = JSON.stringify(satate);
    console.log("save : ", w);
    await AsyncStorage.setItem(STATE_KEY, w);
  };
  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const onChangeText = (event) => {
    console.log("change");
    setText(event);
  };
  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave); // object를 string으로 변환
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      console.log(s);

      setToDos(JSON.parse(s)); //JSON.parse 로 원 형태로 복귀

      const w = await AsyncStorage.getItem(STATE_KEY);
      if (w == "") {
        setWorking(true);
      }

      setWorking(JSON.parse(w));
    } catch (e) {
      console.log(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    setDone(false);
    // ToDos 라는 배열에 추가하기.
    //const newToDos = Object.assign({}, toDos, {
    //[Date.now()]: { text, work: working }, // https://nomadcoders.co/react-native-for-beginners/lectures/3133 제대로 익히기
    //});

    //위 주석과 같은 내용
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done }, //key를 만들어서  기존의 오브젝트에다가 새로운 오브젝트를 만들고 싶음
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  //console.log(toDos);
  const deletToDo = (key) => {
    Alert.alert(
      `${working === true ? "Delete To Do" : "Delete To Travel"}`, // work, travel에 따라 삭제문구 변경
      "Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "Yes I'm sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos }; ///2.하지만 여기서 state의 내용으로 새로운 object를 만들고 있음. 그 내용 때문에 ...를 사용함, 그래서 state의 내용으로 새로운 object를 만듦
            delete newToDos[key];
            setToDos(newToDos); // 1. state 는 mutate를 해주면 안되기 때문에
            saveToDos(newToDos);
          },
        },
      ]
    );
    return;
  };
  const doneToDo = (key) => {
    setDone(!toDos[key].done);
    toDos[key].done = !toDos[key].done;
    console.log("toDo : ", toDos[key].done);
  };
  const editTodo = (key) => {
    setEditKey(key);
  };

  const editToDOText = (key) => {
    toDos[key].text = editText;
    setEditKey("");
  };
  const onChangeEdit = (event) => {
    setEditText(event);
    console.log(editText);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
            onPress={work}
          >
            Work~
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
            onPress={travel}
          >
            Travel!
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          clearTextOnFocus={true}
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          defaultValue=""
          //multiline={true}
          placeholder={working ? "Add a To do" : "Where do you want to go?"}
          style={styles.input}
          value={text}
        />
      </View>
      {loading === true ? ( //로딩창
        <View style={styles.loading}>
          <Text style={styles.loadingText}>
            <ActivityIndicator size="small" color="#ffffff" /> Loading...
          </Text>
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? ( // true === ture , false === flase  형태로 비교
              <View style={styles.toDo} key={key}>
                <View style={styles.toDoCheck}>
                  <Pressable
                    hitSlop={50}
                    style={styles.checkBox}
                    onPress={() => {
                      doneToDo(key);
                    }}
                  >
                    {toDos[key].done === false ? (
                      <Fontisto
                        name="checkbox-passive"
                        size={16}
                        color="white"
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-active"
                        size={16}
                        color="white"
                      />
                    )}
                  </Pressable>
                  {editKey === key ? (
                    <TextInput
                      style={styles.toDoText}
                      autoFocus={true}
                      editable={true}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        editToDOText(key);
                      }}
                      onChangeText={onChangeEdit}
                    ></TextInput>
                  ) : (
                    <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  )}
                </View>
                <View style={styles.iconButton}>
                  <TouchableOpacity
                    onPress={() => {
                      editTodo(key);
                    }}
                  >
                    <EvilIcons name="pencil" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deletToDo(key);
                    }}
                  >
                    <FontAwesome5
                      name="trash-alt"
                      size={18}
                      color={theme.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoneText: {
    color: theme.grey,
    fontSize: 16,
    fontWeight: "500",
    writingDirection: "rtl",
  },
  loading: {
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 22,
  },
  checkBox: { alignItems: "center", paddingRight: 7 },
  iconButton: {
    width: "20%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  toDoCheck: {
    width: "70%",
    flexDirection: "row",
  },
});

// 1. todo, trevel 끌때랑 킬때랑 같은 항목 - check
// 2. todo -완료 기능
// 3. edit text
