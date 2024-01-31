import init from './init'
import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { UserScriptState } from "../data/UserScriptState";
type ActionType<T> = (ctx: Context<Update>, user: {[x: string]: string}, set: (key: string) => (value: string) => Promise<number>, data: T) => void;

export default async function arch() {
  const [ bot, db, bankdb ] = await init();

  const onContactMessage = (startState: UserScriptState, action: ActionType<{ phone_number: string; text: string, photo: string, file: string, stickers: string, video: string, location: number, polls: string, voice: string, audio: string, video_circle: string }>) => 
  bot.on('message', async (ctx, next) => {
    const id = ctx.chat.id,
      user = (await db.getAll(id)()),
      set = db.set(ctx?.chat?.id ?? -1),
      message = ctx.message;
      
    if (user.state === startState) {
      console.log(user['state']);

      switch (true) {
        case 'contact' in message:
          if ('contact' in message) {
            action(ctx, user, set, { phone_number: message.contact.phone_number, text: '', photo: '', file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`TYPE: ONCONTACTMESSAGE, TEXT&PHOTO = UNDEFINED, NUMBER: ${message.contact.phone_number}, CODE: 0\n`);
          } 
          break

        case 'text' in message:
          if ('text' in message) {
            action(ctx, user, set, { phone_number: '', text: message.text, photo: '', file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`\n(!TYPE: ONCONTACTMESSAGE, OTHERDATA = UNDEFINED, TEXT = ${message.text}, CODE: 1\nstate: ${startState}, message: ${message.text}`);
          }
          break;

        case 'photo' in message:
          if ('photo' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: message.photo[0].file_id, file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, PHOTO GET, CODE: 2\n`);
          }
          break;

        case 'document' in message:
          if ('document' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: message.document.file_id, stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, FILE GET, CODE: 3\n`);
          }
          break;

        case 'sticker' in message:
          if ('sticker' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: message.sticker.file_id, video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, STICKER GET, CODE: 4\n`);
          }
          break;

        case 'video' in message:
          if ('video' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video: message.video.file_id, location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, VIDEO GET, CODE: 5\n`);
          }
          break;

        case 'location' in message:
          if ('location' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: message.location.longitude, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, LOCATION GET, CODE: 6\n`);
          }
          break;

        case 'poll' in message:
          if ('poll' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: message.poll.question, voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, POLL GET, CODE: 7\n`);
          }
          break;

        case 'voice' in message:
          if ('voice' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: message.voice.file_id, audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, VOICE GET, CODE: 8\n`);
          }
          break;

        case 'audio' in message:
          if ('audio' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: message.audio.file_id, video_circle: '' });
            console.log(`\n(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, AUDIO GET, CODE: 8\n`);
          }
          break;

        case 'video_note' in message:
          if ('video_note' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: '', video_circle: message.video_note.file_id });
            console.log(`\n(!)TYPE: ONCONTACTMESSAGE, NUMBER&TEXT = UNDEFINED, CIRCLE VIDEO GET, CODE: 9\n`);
          }
          break;

        default:
          console.log('\n(!!)UNDEFINED TYPE MESSAGE, CODE: RED');
          break;
      }
    }
    else return next();
  });
  
  const onTextMessage = (startState: UserScriptState, action: ActionType<{ phone_number: string; text: string, photo: string, file: string, stickers: string, video: string, location: number, polls: string, voice: string, audio: string, video_circle: string }>) => 
  bot.on('message', async (ctx, next) => {
    const id = ctx.chat.id,
      user = (await db.getAll(id)()),
      set = db.set(ctx?.chat?.id ?? -1),
      message = ctx.message;
  
    if (user.state === startState) {
      switch (true) {
        case 'text' in message:
          if ('text' in message) {
            action(ctx, user, set, { phone_number: '', text: message.text, photo: '', file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`\nTYPE: ONTEXTMESSAGE, OTHERDATA = UNDEFINED, TEXT = ${message.text}, CODE: 2\nstate: ${startState}, message: ${message.text}`);
          }
          break;

        case 'photo' in message:
          if ('photo' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: message.photo[0].file_id, file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, PHOTO GET, CODE: 2\n`);
          }
          break;

        case 'document' in message:
          if ('document' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: message.document.file_id, stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, FILE GET, CODE: 3\n`);
          }
          break;

        case 'sticker' in message:
          if ('sticker' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: message.sticker.file_id, video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, STICKER GET, CODE: 4\n`);
          }
          break;

        case 'video' in message:
          if ('video' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video: message.video.file_id, location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, VIDEO GET, CODE: 5\n`);
          }
          break;

        case 'location' in message:
          if ('location' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: message.location.longitude, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, LOCATION GET, CODE: 6\n`);
          }
          break;

        case 'poll' in message:
          if ('poll' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: message.poll.question, voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, POLL GET, CODE: 7\n`);
          }
          break;

        case 'voice' in message:
          if ('voice' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: message.voice.file_id, audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, VOICE GET, CODE: 8\n`);
          }
          break;

        case 'audio' in message:
          if ('audio' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: message.audio.file_id, video_circle: '' });
            console.log(`\n(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, AUDIO GET, CODE: 8\n`);
          }
          break;

        case 'video_note' in message:
          if ('video_note' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: '', video_circle: message.video_note.file_id });
            console.log(`\n(!)TYPE: ONTEXTMESSAGE, NUMBER&TEXT = UNDEFINED, CIRCLE VIDEO GET, CODE: 9\n`);
          }
          break;

        default:
            console.log('\n(!!)UNDEFINED OF TYPE MESSAGE, CODE: RED');
            break;
      }
    }
    else return next();
    console.log(user['name'], '( @', user['username'], ')', '( id:', id, ')', user);
  });
  
  const onPhotoMessage = (startState: UserScriptState, action: ActionType<{ phone_number: string; text: string, photo: string, file: string, stickers: string, video: string, location: number, polls: string, voice: string, audio: string, video_circle: string }>) => 
  bot.on('message', async (ctx, next) => {
    const id = ctx.chat.id,
      user = (await db.getAll(id)()),
      set = db.set(ctx?.chat?.id),
      message = ctx.message,
      supportedFormats : string[] = ['.pdf', '.jpeg', '.jpg', '.png', '.heic'];
      
    if (user.state === startState) {
      console.log(user['state']);

      switch(true){
        case 'text' in message:
          if ('text' in message) {
            action(ctx, user, set, { phone_number: '', text: message.text, photo: '', file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONPHOTOMESSAGE, NUMBER&PHOTO = UNDEFINED, TEXT: ${message.text}, CODE: 1\n`);
          }
          break;

        case 'photo' in message:
          if ('photo' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: message.photo[0].file_id, file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, PHOTO GET, CODE: 2\n`);
          }
          break;

        case 'document' in message:
          if ('document' in message) {
            const fileExtension = message.document.file_name!.substr(message.document.file_name!.lastIndexOf('.')).toLowerCase() || '';
    
            if (supportedFormats.includes(fileExtension)){
              action(ctx, user, set, { phone_number: '', text: '', photo: '', file: message.document.file_id, stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
              console.log(`TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, FILE GET (${fileExtension}), CODE: 3\n`);
            }
            else{
              action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
              console.log(`(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, UNSUPPORTED FILE GET (${fileExtension}), CODE: 3\n`);
            }
          }
          break;

        case 'sticker' in message:
          if ('sticker' in message) {
            action(ctx, user, set,{ phone_number: '', text: '', photo: '', file: '', stickers: message.sticker.file_id, video: '', location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, STICKER GET, CODE: 4\n`);
          }
          break;

        case 'video' in message:
          if ('video' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video: message.video.file_id, location: -1, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, VIDEO GET, CODE: 5\n`);
          }
          break;

        case 'location' in message:
          if ('location' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: message.location.longitude, polls: '', voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, LOCATION GET, CODE: 6\n`);
          }
          break;

        case 'poll' in message:
          if ('poll' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: message.poll.question, voice: '', audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, POLL GET, CODE: 7\n`);
          }
          break;

        case 'voice' in message:
          if ('voice' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: message.voice.file_id, audio: '', video_circle: '' });
            console.log(`\n(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, VOICE GET, CODE: 8\n`);
          }
          break;

        case 'audio' in message:
          if ('audio' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: message.audio.file_id, video_circle: '' });
            console.log(`\n(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, AUDIO GET, CODE: 8\n`);
          }
          break;

        case 'video_note' in message:
          if ('video_note' in message) {
            action(ctx, user, set, { phone_number: '', text: '', photo: '', file: '', stickers: '', video:'', location: -1, polls: '', voice: '', audio: '', video_circle: message.video_note.file_id });
            console.log(`\n(!)TYPE: ONPHOTOMESSAGE, NUMBER&TEXT = UNDEFINED, CIRCLE VIDEO GET, CODE: 9\n`);
          }
          break;

        default:
          console.log('\n(!!)UNDEFINED OF TYPE MESSAGE, CODE: RED');
          break;

      }
    }
    else return next();
  });

  class DBRequest{
    private usersData = bankdb.db('PrivateBankPractice').collection('userCollection');

    async GetUserData(id: number) {
      return await this.usersData.findOne({ id: id });
    }

    async AddData(data: { id: number, name: string, date: string, card: number, phone: string, balance: number, historyAuthor?: string, historyDate?: string, historyTypeOfTransfer?: string, historyText?: string }) {
      data.historyAuthor === undefined ? data.historyAuthor = '' : data.historyAuthor;
      data.historyDate === undefined ? data.historyDate = '' : data.historyDate;
      data.historyText === undefined ? data.historyText = '' : data.historyText;
      data.historyTypeOfTransfer === undefined ? data.historyTypeOfTransfer = '' : data.historyTypeOfTransfer;
      return await this.usersData.insertOne(data);
    }
    
    async PermanentlyDeleteUser(id: number) {
      await this.usersData.deleteOne({ id: id });
    }

    async WriteNewTransactionHistory(idUser: number, data: { historyAuthor: string, historyDate: string, historyTypeOfTransfer: string, historyText: string }){
      const user = await this.GetUserData(idUser),
        historyAuthorDB = user!.historyAuthor === '' || user!.historyAuthor === undefined ? false : user!.historyAuthor.toString(),
        historyDateDB = user!.historyDate === '' || user!.historyDate === undefined ? false : user!.historyDate.toString(),
        historyTypeOfTransferDB = user!.historyTypeOfTransfer === '' || user!.historyTypeOfTransfer === undefined ? false : user!.historyTypeOfTransfer.toString(),
        historyTextDB = user!.historyText === '' || user!.historyText === undefined ? false : user!.historyText.toString();
      let result = 0;

      if (historyAuthorDB){
        const dataContain = historyAuthorDB.split(',');
        dataContain.push(data.historyAuthor);

        const updateObject = {$set : {
          historyAuthor: dataContain.join(',')
        }}

        await this.usersData.updateOne({_id: user!._id}, updateObject);
      }
      else{
        const updateObject = {$set : {
          historyAuthor: data.historyAuthor
        }}

        await this.usersData.updateOne({_id: user?._id}, updateObject);
      }

      if (historyDateDB){
        const dataContain = historyDateDB.split(',');
        dataContain.push(data.historyDate);

        const updateObject = {$set : {
          historyDate: dataContain.join(',')
        }}

        await this.usersData.updateOne({_id: user!._id}, updateObject);
      }
      else{
        const updateObject = {$set : {
          historyDate: data.historyDate
        }}

        await this.usersData.updateOne({_id: user?._id}, updateObject);
      }

      if (historyTypeOfTransferDB){
        if (data.historyTypeOfTransfer === 'incoming' || data.historyTypeOfTransfer === 'outgoing'){
          const dataContain = historyTypeOfTransferDB.split(',');
          dataContain.push(data.historyTypeOfTransfer);
  
          const updateObject = {$set : {
            historyTypeOfTransfer: dataContain.join(',')
          }}

          if (data.historyTypeOfTransfer === "incoming") result = parseInt(user!.balance) + parseInt(data.historyText);
          else result = parseInt(user!.balance) < parseInt(data.historyText) ? parseInt(user!.balance) : parseInt(user!.balance) - parseInt(data.historyText);
  
          await this.usersData.updateOne({_id: user!._id}, updateObject);
          await this.ChangeCardBalance(idUser, result);
        }
        else{
          console.error('\n\n\n Error while processing code, uncorrect parameter received in WriteNewTransactionHistory() function. Use "incoming" or "outgoing".');
          process.exit(1);
        }
      }
      else{
        if (data.historyTypeOfTransfer === 'incoming' || data.historyTypeOfTransfer === 'outgoing'){
          const updateObject = {$set : {
            historyTypeOfTransfer: data.historyTypeOfTransfer
          }}

          if (data.historyTypeOfTransfer === "incoming") result = parseInt(user!.balance) + parseInt(data.historyText);
          else result = parseInt(user!.balance) < parseInt(data.historyText) ? parseInt(user!.balance) : parseInt(user!.balance) - parseInt(data.historyText);
  
          await this.usersData.updateOne({_id: user?._id}, updateObject);
          await this.ChangeCardBalance(idUser, result);
        }
        else{
          console.error('\n\n\n Error while processing code, uncorrect parameter received in WriteNewTransactionHistory() function. Use "incoming" or "outgoing".');
          process.exit(1);
        }
      }

      if (historyTextDB){
        const dataContain = historyTextDB.split(',');
        dataContain.push(data.historyTypeOfTransfer === 'outgoing' && parseInt(user!.balance) < parseInt(data.historyText) ? 
        "fail" : data.historyText);

        const updateObject = {$set : {
          historyText: dataContain.join(',')
        }}

        await this.usersData.updateOne({_id: user!._id}, updateObject);
      }
      else{
        const updateObject = {$set : {
          historyText: data.historyText
        }}

        await this.usersData.updateOne({_id: user?._id}, updateObject);
      }
    }

    async ChangeCardBalance(id: number, newValue: number){
      const updateObject = {$set: {balance: newValue}};

      await this.usersData.updateOne({id: id}, updateObject);
    }

    async GetUserTransactionsHistory(idUser: number){
      const user = await this.GetUserData(idUser),
        historyAuthorDB = user!.historyAuthor !== '' ? user!.historyAuthor.toString() : false,
        historyDateDB = user!.historyDate !== '' ? user!.historyDate.toString() : false,
        historyTypeOfTransferDB = user!.historyTypeOfTransfer !== '' ? user!.historyTypeOfTransfer.toString() : false,
        historyTextDB = user!.historyText !== '' ? user!.historyText.toString() : false;
      
      let historyAuthorDBProcessed = 'Дані Відсутні',
        historyDateDBProcessed = 'Дані Відсутні',
        historyTypeOfTransferDBProcessed = 'Дані Відсутні',
        historyTextDBProcessed = 'Дані Відсутні';

      if (historyAuthorDB) historyAuthorDBProcessed = historyAuthorDB.split(',');
    
      if (historyDateDB) historyDateDBProcessed = historyDateDB.split(',');

      if (historyTypeOfTransferDB) historyTypeOfTransferDBProcessed = historyTypeOfTransferDB.split(',');

      if (historyTextDB) historyTextDBProcessed = historyTextDB.split(',');

      return [ historyAuthorDBProcessed, historyDateDBProcessed, historyTypeOfTransferDBProcessed, historyTextDBProcessed ] as const;
    }
  }

  const dbRequest : DBRequest = new DBRequest();

  return [onTextMessage, onContactMessage, onPhotoMessage, bot, db, dbRequest] as const;
}