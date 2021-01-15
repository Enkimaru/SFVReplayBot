fs = require('fs');

module.exports = function() { 
    this.replayList = [];
    this.queueSubscriberPriority = 2;
    this.filaAberta = false;
    this.replayRewardId = '0f3463c2-c631-4ca2-9f5e-4c936a9e6c13';


    this.addReplayToList = function (replayId, tags){
        var replay = {username: tags.username, displayName: tags["display-name"], replayId: replayId, subscriber: tags.subscriber}
        var userIndex = findUserOnReplayList(tags.username);

        if (userIndex >= 0) {
            replayList.splice(userIndex, 1, replay);
        } else if (tags.subscriber == true && queueSubscriberPriority >= 0) {
            var position = findLastSubscriberPosition();
            if (position == -1) {
            replayList.splice(0, 0, replay);
            } else {
            replayList.splice(position + queueSubscriberPriority + 1, 0, replay);
            }      
        } else {
            replayList.push(replay);
        }
        updateQueueFile();

    }

    this.leaveFromReplayList = function (tags){
        var userIndex = findUserOnReplayList(tags.username);

        if (userIndex >= 0) {
            replayList.splice(userIndex, 1);
            updateQueueFile();
            return 1
        } 
        return 0

    }

    this.replayCheck = function (replayString) {
        
        if (replayString.length != 9) {
            return "o replay deve conter 9 caracteres!"
        }

        var replayHex = parseInt(replayString,16);
        if (replayHex.toString(16) != replayString.toLowerCase()){
            return "o replay parece ter caracteres inválidos!"
        }

        return replayString
    }

    this.replaceZeros = function (replayString) {
        return replayString.replace(/o|O/g, "0");
    }

    this.findLastSubscriberPosition = function() {
        const replayListSubscriberMap = replayList.map(el => el.subscriber);
        return replayListSubscriberMap.lastIndexOf(true);
    }

    this.findUserOnReplayList = function(user) {
        const replayListSubscriberMap = replayList.map(el => el.username);
        return replayListSubscriberMap.lastIndexOf(user);
    }

    this.getQueueString = function () {
        var stringQueue = '════Fila de Replays════ ';
        console.log(replayList.length)
        replayList.forEach((element, index) => {
            stringQueue = stringQueue.concat(' — ' + (index+1) + ':•' + element.displayName + '' )
            console.log(element.displayName);
        });
        return stringQueue
    }
    
    this.updateQueueFile = function () {
        var stringQueue = '';
        replayList.forEach((element, index) => {
            stringQueue = stringQueue.concat(element.replayId + ' - ' + element.displayName)
            stringQueue = stringQueue.concat(((element.subscriber == true) ? " *Sub*": "") + '\n')
        });
        //stringQueue = stringQueue.concat("- Fim da Lista -")
        fs.writeFile('queue.txt', stringQueue, function (err) {
            if (err) return console.log(err);
                console.log('Lista atualizada');
        });
    }

    this.updateReplayList = function (client, channel) {
        if (replayList.length > 0) {
            var nextOnQueue = replayList[0];
            client.say(channel, `O próximo da fila é o @${nextOnQueue.username}, com o replay:
            ${nextOnQueue.replayId}`);
        
            replayList.splice(0, 1);
        } else {
            client.say(channel, `A fila está vazia!`);
        }
    }
}