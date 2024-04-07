import { useEffect, useState} from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, View, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as MailComposer from 'expo-mail-composer';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';

const soundObject = new Audio.Sound();

  const playSound = async () => {
    try {
      const sound = await soundObject.loadAsync(require('./sound.mp3'));
      await soundObject.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      await soundObject.unloadAsync();
    }
  };

Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("Receiving Notification");
    playSound();
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
    };
  },
});

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
  console.log('Received a notification in the background!');
  // Do something with the notification data
  playSound();
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);


export default function App() {
  const [pushNotification, setPushNotification] = useState('');
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }

      //const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId
      });
      console.log('projectid  =' + Constants.expoConfig.extra.eas.projectId,)
      console.log(pushTokenData);
      setPushNotification(pushTokenData);
      console.log("pushNotification = " + pushNotification.data);
      //Alert.alert("pushNotification = " + pushNotification.data);
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Max" },
      },
      trigger: {
        seconds: 5,
      },
    });
  }
  /*
  function setPushNotificationHandler() {
    console.log("sending");
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // convrt a JS object in to json string
      body: JSON.stringify({
        to: "ExponentPushToken[W6UDhlPj10c4RoRxvg_lUo]",
        title: "Test from devid",
        body: " Body test",
      }),
    });
  }
*/

const sendEmail = async () => {
  try {
    Alert.alert("pushNotification = " + pushNotification.data);
    const result = await MailComposer.composeAsync({
      recipients: ['msher3@gmail.com'],  // An array of email addresses for TO field
      subject: 'PushToken of this App',                  // Email subject
      //body: 'Test body content',                // Email body
      body: pushNotification.data,
      isHtml: false,                            // If the body is HTML or plain text
    });

    if (result.status === 'sent') {
      console.log('Email sent successfully');
    } else {
      console.log('Email not sent');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

  // send to myself: ExponentPushToken[q4Sn7cPImxwAnEDwStEnFG]
  function sendPushNotificationHandler() {
    console.log("my sending");
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushNotification.data,
        title: "Test - sent from Triplebit  Israel!",
        body: "This is a test!",
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Button
        title="send email with pushToken"
        onPress={sendEmail}
      />
      {/*<Button
        title="Send Push Notification"
        onPress={sendPushNotificationHandler}
  />*/}
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
