// const config = require('./config.json');
const config = {
  checkInterval: 60000,
  widgetJsonApi:
    'https://ptb.discord.com/api/guilds/850061046424797254/widget.json',
  ifttt: {
    key: process.env.IFTTT_KEY,
    event: process.env.IFTTT_EVENT,
  },
};
const axios = require('axios').default;

async function checkIfOnline() {
  const { data } = await axios.get(config.widgetJsonApi);
  const count = data.presence_count;
  if (count == 2) {
    sendNotification('The other one is on Discord!');
  }
  if (count == 1 && data.members.length == 0) {
    sendNotification('One of you are invisible.');
  }
}

function sendNotification(message) {
  axios.post(
    `https://maker.ifttt.com/trigger/${config.ifttt.event}/with/key/${config.ifttt.key}`,
    { value1: message }
  );
}

checkIfOnline();
setInterval(checkIfOnline, config.checkInterval);
