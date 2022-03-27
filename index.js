// const config = require('./config.json');
const config = {
  checkInterval: 30000,
  widgetJsonApi: process.env.DISCORD_API,
  realAccountName: 'Test User',
  ifttt: {
    event: process.env.IFTTT_EVENT,
    key: process.env.IFTTT_KEY,
  },
};
const axios = require('axios').default;

/**
 * @type {Date}
 */
let lastError = null;

async function checkIfOnline() {
  const { data } = await axios.get(config.widgetJsonApi).catch((error) => {
    console.error(error);
    if (Date.now() > lastError?.getMilliseconds() + 6 * 60 * 60 * 1000)
      sendNotification('An error occured while fetching data from Discord');
    lastError = new Date();
  });

  if (!data) return;

  /**
   * @type {number}
   */
  const count = data.presence_count;
  /**
   * @type {Member[]}
   */
  const members = data.members;

  /**
   * @type {'00'|'01'|'02'|'10'|'11'|'12'|'20'|'21'|'22'}
   */
  const generated = `${count}${members.length}`;
  switch (generated) {
    case '00':
    case '01':
    case '02':
    case '12':
      // Impossible or nothing, see count-length.txt
      break;
    case '10':
      sendNotification('One of them is invisible');
      break;
    case '11':
      if (members[0].username !== config.realAccountName)
        sendNotification('The other one is online');
      break;
    case '20':
      sendNotification('Both are invisible');
      break;
    case '21':
      // Online is the real one
      if (members[0].username === config.realAccountName)
        sendNotification('The other one is invisible');
      else sendNotification('The other one is online');
      break;
    case '22':
      sendNotification('Both are online');
      break;
    default:
      break;
  }
}

function sendNotification(message) {
  axios
    .post(
      `https://maker.ifttt.com/trigger/${config.ifttt.event}/with/key/${config.ifttt.key}`,
      { value1: message }
    )
    .catch(() => {});
}

sendNotification(
  `Starting Discord Online Listener... (Interval: ${config.checkInterval}ms)`
);

checkIfOnline();
setInterval(checkIfOnline, config.checkInterval);

/**
 * @typedef Member
 * @property {string} id
 * @property {string} username
 * @property {string} discriminator
 * @property {string} avatar
 * @property {'online'|'idle'|'dnd'|'offline'} status
 * @property {string} avatar_url
 */
