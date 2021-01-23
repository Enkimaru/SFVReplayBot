module.exports = function() { 
    this.replayList = [];

    this.addReplayToList = function (replayId, tags){
        let replay = {username: tags.username, displayName: tags["display-name"], replayId: replayId, subscriber: tags.subscriber}
        let userIndex = findUserOnReplayList(tags.username);

        if (userIndex >= 0) {
            replayList.splice(userIndex, 1, replay);
        } else if (tags.subscriber == true && queueSubscriberPriority >= 0) {
            let position = findLastSubscriberPosition();
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
        let userIndex = findUserOnReplayList(tags.username);

        if (userIndex >= 0) {
            replayList.splice(userIndex, 1);
            updateQueueFile();
            return 1
        } 
        return 0

    }

    this.replayCheck = function (replayString) {
        
        if (replayString.length != 9) {
            return "O replay deve conter 9 caracteres! Verifique a ID e tente novamente."
        }

        if (replayString[0] == 0) {
            return "O replay não pode começar com 0! Verifique a ID e tente novamente."
        }
        let replayHex = parseInt(replayString,16);

        if (replayHex.toString(16) != replayString.toLowerCase()){
            return "O Replay possui caracteres inválidos! Verifique a ID e tente novamente."
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
        let stringQueue = '════Fila de Replays════ ';
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
            stringQueue = stringQueue.concat(((element.subscriber == true) ? "*": "") + '\n')
        });
        fs.writeFile('queue.txt', stringQueue, function (err) {
            if (err) return console.log(err);
                console.log('Lista atualizada');
        });
    }

    this.updateReplayList = function (client, channel) {
        if (replayList.length > 0) {
            let nextOnQueue = replayList[0];
            client.say(channel, `O próximo da fila é o @${nextOnQueue.username}, com o replay:
            ${nextOnQueue.replayId}`);
            replayList.splice(0, 1);
            updateQueueFile();
        } else {
            client.say(channel, `A fila está vazia!`);
        }
    }

    this.loadQueueFromFile = function (queueFile) {
        fs.readFileSync(queueFile, 'utf-8').split(/\r?\n/).forEach(function(line) {
            if (line != '') {
                let replayId = line.substring(0,9).toUpperCase();
                let replayUsername = line.substring(12);
                let replaySubscriber = false;
                let subCheck = replayUsername.search(/\*/g);

                if (subCheck >= 0){
                    replaySubscriber = true;
                    replayUsername = replayUsername.split('*')[0]
                }
                let tags = {username: replayUsername.toLowerCase(), 'display-name': replayUsername, subscriber: replaySubscriber}
                addReplayToList(replayId, tags)
            }
        });
    }

    this.clearQueue = function () {
        replayList = [];
        fs.writeFile(queueFile, "", function (err) {
                if (err) return console.log(err);
                console.log('Lista atualizada');
        });
    }
        
}