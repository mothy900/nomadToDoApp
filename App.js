import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  placeholder,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { theme } from "./color";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({}); //여기에 Array를 넣기도 하지만 이번 프로젝트에선 hashmap 을 만들것

  useEffect(() => {
    // 화면 켜지자마자 실행
    loadToDos();
  }, []);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (event) => setText(event);
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
    } catch (e) {
      console.log(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    // ToDos 라는 배열에 추가하기.
    //const newToDos = Object.assign({}, toDos, {
    //[Date.now()]: { text, work: working }, // https://nomadcoders.co/react-native-for-beginners/lectures/3133 제대로 익히기
    //});

    //위 주석과 같은 내용
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);

    setText("");
  };
  //console.log(toDos);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work~
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
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
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? ( // true === ture , false === flase  형태로 비교
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
            </View>
          ) : null
        )}
      </ScrollView>
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
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
