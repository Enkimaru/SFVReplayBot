require('./functions.js')();
require('./client.js')();

fs = require('fs');

const firstline = require('firstline');

client.connect().catch(console.error);

loadQueueFromFile(queueFile)

fs.watchFile(queueFile, (curr,prev) => {
    firstline(queueFile).then(line => {
        const match = /\r|\n/.exec(line);
        if (match || line === "") {
            updateReplayList(client, client.channels[0]);
        }
    });
})


console.log(`Watching for file changes on ${queueFile}`);

client.on('message', (channel, tags, message, self) => {
        if(self || message[0] !== '!') return;
        if(message.toLowerCase().startsWith('!replay')) {
            if (queueOpen == false) {
                client.say(channel, 'A fila de replays está fechada!')
            } else {
                if (tags.badges.broadcaster == 1 || tags.subscriber == true) {
                    var replayId = message.substring(8).toUpperCase();
                    replayId = replaceZeros(replayId);
                    var checkStringReplay = replayCheck(replayId);

                    if (checkStringReplay === replayId) {
                        client.say(channel, `@${tags.username}, replay com ID: ${replayId} adicionado na fila.`);
                        addReplayToList(replayId, tags);
                    } else {
                        client.say(channel, `@${tags.username}, ` + checkStringReplay)
                    }
                } else {
                    client.say(channel, `@${tags.username}, você precisa ser inscrito no canal para usar este comando. Tente usar a recompensa de pontos em Revisão de Partida.`);  
                }
            }

        } else if (message.toLowerCase() === '!fila'){
            var queueString = getQueueString();
            client.say(channel, `${queueString}`);

        } else if (message.toLowerCase() === '!abrir'){
            if (tags.badges.broadcaster == 1) {
                if(queueOpen == true) {
                    client.say(channel, `Isso, abra a fila já aberta 4Head`); 
                } else {
                    queueOpen = true;
                    client.say(channel, `A fila de Replays está aberta.`);
                }
            }

        } else if (message.toLowerCase() === '!fechar'){
            if (tags.badges.broadcaster == 1) {
                if(queueOpen == false) {
                    client.say(channel, `Os portões já estão fechados.`); 
                } else {
                    queueOpen = false;
                    client.say(channel, `A fila de replays fechou!`);
                }
            }

        } else if (message.toLowerCase() === '!prox'){
            if (tags.badges.broadcaster == 1) {
                updateReplayList(client, channel);
            }

        } else if (message.toLowerCase() === '!sair'){
                if (leaveFromReplayList(tags) == 1) {
                    client.say(channel, `@${tags.username}, você saiu da fila!`);
                } else {
                    client.say(channel, `@${tags.username}, você está tentando sair de uma fila que não entrou Pepega!`); 
                }

        } else if (message.toLowerCase() === '!pos'){
                var userIndex = findUserOnReplayList(tags.username);
                if (userIndex >= 0) {
                    client.say(channel, `@${tags.username}, você está na posição Nº${userIndex+1} com o replay ${replayList[userIndex].replayId}`);
                } else {
                    client.say(channel, `@${tags.username}, você não está na fila!`)
                }
        } else if (message.toLowerCase() === '!carregar'){
            if (tags.badges.broadcaster == 1) {
                loadQueueFromFile(queueFile);
                client.say(channel, `Carregando fila pelo arquivo.`)
            }

        } else if (message.toLowerCase() === '!limpar'){
            if (tags.badges.broadcaster == 1) {
                clearQueue();
            }
        }
});

client.on('redeem', (channel, username, rewardType, tags, message) => {
    if (rewardType == replayRewardId) {
        if (queueOpen == false) {
                client.say(channel, 'A fila de replays está fechada!')
        } else {
        var replayId = message.toUpperCase();
        replayId = replaceZeros(replayId);
                
        var checkStringReplay = replayCheck(replayId);

        if (checkStringReplay === replayId) {  
            client.say(channel, `@${tags.username}, replay com ID: ${replayId} adicionado na fila.`);
            addReplayToList(replayId, tags);
            } else {
                client.say(channel, `@${tags.username}, ` + checkStringReplay)
            }
        }
    }

})
