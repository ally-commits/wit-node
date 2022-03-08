require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Wit } = require('node-wit');
const Pusher = require('pusher');

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true,
});
const client = new Wit({
    accessToken: process.env.WIT_ACCESS_TOKEN,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const responses = {
    greetings: ["Hey, how's it going?", "What's good with you?"],

    jokes: [
        'Do I lose when the police officer says papers and I say scissors?',
        'I have clean conscience. I haven’t used it once till now.',
        'Did you hear about the crook who stole a calendar? He got twelve months.',
    ],
};

const firstEntityValue = (entities, entity) => {
    const val =
        entities &&
        entities[`${entity}:${entity}`] &&
        Array.isArray(entities[`${entity}:${entity}`]) &&
        entities[`${entity}:${entity}`].length > 0 &&
        entities[`${entity}:${entity}`][0].value;

      
    console.log(entities)
    console.log(entity);
    if (!val) {
        return null;
    }

    return val;
};

const handleMessage = ({ entities }) => {
    const greetings = firstEntityValue(entities, 'greetings');
    const jokes = firstEntityValue(entities, 'jokes');

    if (greetings) {
        return pusher.trigger('bot', 'bot-response', {
            message:
                responses.greetings[
                Math.floor(Math.random() * responses.greetings.length)
                ],
        });
    }

    if (jokes) {
        return pusher.trigger('bot', 'bot-response', {
            message:
                responses.jokes[
                Math.floor(Math.random() * responses.jokes.length)
                ],
        });
    }

    return pusher.trigger('bot', 'bot-response', {
        message: 'I can tell jokes! Say \'tell me a joke\'',
    });
};

app.get('/',(req,res) => {
    res.status(200).send('Hey there from wit ai')
})
app.post('/chat', (req, res) => {
    const { message } = req.body;

    client
        .message(message)
        .then(data => {
            // console.log(data);
            handleMessage(data);
        })
        .catch(error => console.log(error));
});

app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});