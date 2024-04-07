import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, Text, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    //first check the permission
    async function configurePushNotifications() {
      if (Platform.OS === "android") {
        let channel = await Notifications.setNotificationChannelAsync(
          "default",
          {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          }
        );
        console.log("channel = " + status);
      }

      // the following tells us what is the stsus of permission
      const { status } = await Notifications.getPermissionsAsync();
      console.log("getPermissionsAsync = " + status);
      let finalStatus = status;

      if (finalStatus !== "granted") {
        // we have to ask for permission
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("requestPermissionsAsync = " + status);
        finalStatus = status;
      }
      // check again after asking for permission
      if (finalStatus !== "granted") {
        Alert.alert("Push Notification not granted");
        // to makr sure the rest is not excute
        return;
      }
      // if permission is granted we can get the token
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log("pushTokenData =" + pushTokenData);

      // extra code that is needed for adroid only
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);
  useEffect(() => {
    // not related to user response to notification
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICION RECEIVED ");
        console.log(JSON.stringify(notification, null, 2));
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );
    // Related to user response - tap on notification
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICION REONSE RECEIVED ");
        console.log(JSON.stringify(response, null, 2));
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );
    return () => {
      subscription.remove();
      subscription2.remove();
    };
  }, []);
  const scheduleNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My First Notification",
        body: "Notification Body",
        data: { userName: "Max" },
      },
      trigger: { seconds: 5 },
    });
  };
  return (
    <View style={styles.container}>
      <Button
        title="Scehdul Notification"
        onPress={scheduleNotificationHandler}
      ></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
