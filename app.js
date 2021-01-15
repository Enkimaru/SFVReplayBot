require('./functions.js')();

const tmi = require('tmi.js');
const fs = require('fs');
const queueFile = './queue.txt';
const firstline = require('firstline');

const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'SFVReplayBot',
		password: 'oauth:1iw3w2xfwixe4wrtuoaq4o2sigwk4g'
	},
	channels: [ 'keomapacheco' ]
});
client.connect().catch(console.error);




console.log(`Watching for file changes on ${queueFile}`);

fs.watchFile(queueFile, (curr,prev) => {
    firstline(queueFile).then(line => {
        if (line === "") {
            console.log("Vazio")
            updateReplayList(client, client.channels[0]);
        }
    });
})

client.on('message', (channel, tags, message, self) => {
        if(self || message[0] !== '!') return;
        
        if(message.toLowerCase().startsWith('!replay')) {
            if (filaAberta == false) {
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
                filaAberta = true;
                client.say(channel, `A fila de replays está aberta!`);
            }

        } else if (message.toLowerCase() === '!fechar'){
            if (tags.badges.broadcaster == 1) {
                filaAberta = false;
                client.say(channel, `A fila de replays fechou!`);
            }

        } else if (message.toLowerCase() === '!prox'){
            if (tags.badges.broadcaster == 1) {
                updateReplayList(client, channel);
            }

        } else if (message.toLowerCase() === '!sair'){
                if (leaveFromReplayList(tags) == 1) {
                    client.say(channel, `@${tags.username}, você saiu da fila!`);
                } else {
                    client.say(channel, `@${tags.username}, você não está fila!`); 
                }
        } 

});

client.on('redeem', (channel, username, rewardType, tags, message) => {
    if (rewardType == replayRewardId) {
        if (filaAberta == false) {
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
