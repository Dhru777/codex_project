import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// This function sets the loading dots when the bot is thinking 
function loader(element)
{
   element.textContent = '';

   loadInterval = setInterval(() => {
     element.textContent += '.';

     if(element.textContent === '....')
     {
        element.textContent = '';
     }
   }, 300)
}

// This function will give out the bot response letter by
// letter and not the entire text at the same time

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
      if(index < text.length)
      {
         element.innerHTML += text.charAt(index);
         index++;
      }
      else {
        clearInterval(interval);
      }
  }, 20)
}

//This function creates a unique ID for the messages to be mapped 
// We generate this using date, math.random and converting it to hexadecimal 

function generateUniqueId()
{
     const timestamp = Date.now();
     const randomNumber = Math.random();
     const hexadecimalString = randomNumber.toString(16);

     return `id-${timestamp}-${hexadecimalString}`;
}

// This function creates the striped blocks between bot and user

function chatStripe(isAi, value, uniqueId)
{
    return (
      `
        <div class="wrapper ${isAi && 'ai'}">
          <div class = "chat">
            <div class = "profile">  
              <img 
                  src = "${isAi ? bot: user}"
                  alt = "${isAi ? 'bot' : 'user'}"
              />
            </div>
              <div class = "message" id= ${uniqueId}>${value}</div>  
          </div>

        </div>
        `
    )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight; // user should be able to see the message through scrolling

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from the server -> bot's response

  const response = await fetch('http://localhost:5000', {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        prompt: data.get('prompt')
      })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = ''; // we are not sure which point in loading we are right now

   if(response.ok) {
     const data = await response.json();
     const parsedData = data.bot.trim();

     typeText(messageDiv, parsedData);
   }else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
   }
}

//call the handle submit to be able to see the changes 

form.addEventListener('submit', handleSubmit);

//we can also invoke this using the enter key 
// when we press the key and lift it up, it checks for the keycode
// for enter key the keycode is 13
form.addEventListener('keyup' , (e) => {
   if(e.keyCode === 13)
      handleSubmit(e);
})




