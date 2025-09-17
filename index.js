require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.API_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const userStates = {}

bot.on('polling_error', (error) => {
  console.error('Полная ошибка Polling:', error);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeText = 'Чтобы открыть свой подарок 🎁, тебе нужно выполнить следующее испытание:\n' +
    '💃 Станцуй танец в приложении Likee — под свой любимый трек или выбери самый популярный танец.\n' +
    '📲 Запиши видео и отправь его сюда, в бота.\n' +
    'Когда задание будет выполнено, подарок станет твоим! ✨\n';

  userStates[chatId] = 'waiting_for_video';

  bot.sendMessage(chatId, welcomeText);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const currentState = userStates[chatId];

  if (currentState === 'waiting_for_video') {
    if (msg.video || msg.document && msg.document.mime_type?.includes('video')) {
      bot.sendMessage(chatId, '🤔Таакс, дай-ка мне пару секунд получше посмотреть 👀');
      setTimeout(() => {
        const secondMessage = '🌟 Ура,Рита! 🌟\n' +
          'Ты справилась с первым заданием — это было круто! 💃🔥\n' +
          'Но ведь ты не думала, что всё будет так просто? 😉\n' +
          'Это только начало 🎯\n' +
          'За твоё старание ты получаешь 🎁 свой стикерпак — онлайн и офлайн!\n' +
          'Нажми <a href="https://t.me/addstickers/stickeRitaaa">сюда</a>, чтобы забрать его😊\n\n' +
          'А чтобы перейти ко второму заданию, нажми на 💗\n';

        const opts = {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [ { text: '💗' } ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        };
        bot.sendMessage(chatId, secondMessage, opts);
        userStates[chatId] = 'second_task';
      }, 3000);

    } else {
      // Пользователь отправил что-то другое (текст, фото, аудио)
      bot.sendMessage(chatId, '🤗Мне всегда приятно с тобой пообщаться, но сейчас я жду от тебя именно видео. Попробуй еще раз 👀');
    }
  } else if (currentState === 'second_task') {
    if (msg.text === '💗') {
      const thirdMessage = '💗 Рита, впереди тебя ждёт более сложное, но не менее интересное задание! 🎯\n' +
        '🔎 Где-то дома спрятаны 6 коробок. В каждой из них лежит предмет.\n' +
        'Твоя задача: с закрытыми глазами 👀 угадать, что это за предмет.\n' +
        'Когда ты угадаешь, в коробке тебя будет ждать часть пазла 🧩.\n' +
        'Собери все части воедино — и тогда они приведут тебя к твоему настоящему подарку на день рождения 🎁✨\n' +
        '🌸Но сначала тебе нужно найти эти самые коробки.\n' +
        '\n' +
        '\n' +
        ' А для этого — очаруй своих родителей 💕, и они дадут тебе подсказку, где искать!\n';

      bot.sendMessage(chatId, thirdMessage, {
        reply_markup: {
          remove_keyboard: true
        }
      });
      userStates[chatId] = 'karaoke';

      // setTimeout(() => {
      //   const message = 'Чтобы продолжить нажми на белое сердце';
      //   const opts = {
      //     reply_markup: {
      //       keyboard: [
      //         [ { text: '🤍' } ],
      //       ],
      //       resize_keyboard: true,
      //       one_time_keyboard: true,
      //       disable_notification: true
      //     }
      //   };
      //   bot.sendMessage(chatId, message, opts);
      // }, 10000);
    }
  } else if (currentState === 'karaoke') {
    if (msg.text.toLowerCase() === 'я хочу спеть песню') {
      // Показываем статус "загрузка видео"
      await bot.sendChatAction(chatId, 'upload_video');

      // Отправляем видео
      const sentVideo = await bot.sendVideo(
        chatId,
        './Rita.mp4',
        {
          caption: '🎬 О-о-о, а я как раз подготовил для тебя песню 🎶\n' +
            'Споёшь её для нас? 🎤✨',
          parse_mode: 'HTML',
          duration: 224,
          width: 1920,
          height: 1080,
          supports_streaming: true // разрешает потоковое воспроизведение
        }
      );
      userStates[chatId] = 'voice';
    }
  } else if (currentState === 'voice') {
    if (msg.text === '🤍') {
      const message = 'Ух ты какой удивительный у тебя подарок! А можешь, пожалуйста, и для меня что-нибудь сыграть?🥹';
      bot.sendMessage(chatId, message);
    } else if (msg.voice && msg.voice.duration > 0) {
      const message = '🌟 Рита, ты большая молодец! 🌟\n' +
        'Ты согласилась на дополнительное задание, хотя уже разгадала столько загадок и прошла столько испытаний 🎯✨\n' +
        'Но это будет чуть проще: тебе осталось всего лишь прослушать песню 🎶 и понять, о каком месте идет речь 🎁\n' +
        'Я верю, что это стоит твоих стараний 💖\n' +
        'Спасибо, что играла и была такой смелой и находчивой!\n' +
        'До новых встреч! 🌸👋\n';
      bot.sendMessage(chatId, message);

      try {
        await bot.sendChatAction(chatId, 'upload_voice');
        const sentAudio = await bot.sendAudio(
          chatId,
          './Rita_Birthday.mp3',
          {
            caption: '',
            parse_mode: 'HTML',
            title: 'Секретная комната',
            performer: 'День Рождения Риты',
            duration: 135,
          }
        );
      } catch (error) {
        console.error('Ошибка отправки аудио:', error);
      }

      userStates[chatId] = null;
    } else {
      bot.sendMessage(chatId, '🤗Отправь мне, пожалуйста, голосовое сообщение чтобы я мог насладиться игрой)');
    }
  }
});

// Выводим в консоль сообщение об успешном запуске
console.log('Бот запущен и начал опрашивать серверы Telegram...');