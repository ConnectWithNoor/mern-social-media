const newMsgSound = (senderName) => {
  const sound = new Audio('/light.mp3');

  sound && sound.play();
  if (senderName) {
    document.title = `New Message from ${senderName}`;

    if (document.visibilityState === 'visible') {
      setTimeout(() => {
        document.title = 'Message';
      }, 3000);
    }
  }
};

export default newMsgSound;
