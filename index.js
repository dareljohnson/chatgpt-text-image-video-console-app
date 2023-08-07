//No More ChatGPT: Build Your Own AI With OpenAI
// https://levelup.gitconnected.com/no-more-chatgpt-build-your-own-ai-with-openai-73a5c087b660

import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
import readline from 'readline';
import https from 'https';
import fs from 'fs';
import { default as Replicate } from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openAi = new OpenAIApi(configuration);

const banner = `
\x1b[1m\x1b[34m+----------------------------------------------------------------------------+
|                         \x1b[36mConsole ChatGPT 1.0\x1b[34m                                |
+----------------------------------------------------------------------------+\x1b[0m
Commands:

    history: Show the last 10 messages in the conversation.
    save: Save the conversation history to a file.
    image: 
        <prompt>: Enter a prompt to generate an image.
        <generator>: Choose an image generator at the prompt.
    video: 
        <prompt>: Enter a prompt to generate a video.
        <generator>: Choose a video generator at the prompt.
    new topic: Start a new conversation topic.
    exit: Exit the program.
    quit: Exit the program.


Send a message at the prompt to ChatGPT and it will respond.
`;

console.log(banner);
console.log('\n');

// Create a User Interface
const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Image directory
const imageDirectory = 'images';
if (!fs.existsSync(imageDirectory)) {
    fs.mkdirSync(imageDirectory);
}

// Video directory
const videoDirectory = 'videos';
if (!fs.existsSync(videoDirectory)) {
    fs.mkdirSync(videoDirectory);
}

// history directory
const historyDirectory = 'history';
if (!fs.existsSync(historyDirectory)) {
    fs.mkdirSync(historyDirectory);
}

// conversation history
const conversationHistory = [];

// Sanitize a Filename
const sanitizeFilename = (text, maxLength = 50) => {
    const excerpt = text.split(/\s+/).slice(0, 9).join(' ').trim();
    const sanitized = excerpt.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    return sanitized.substring(0, maxLength);
};

// Download a File
const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(resolve);
        });
        
    }).on('error', (err) => {
        fs.unlink(dest, () => {
            reject(err);
        });
    });
});

// Generate an Image
const generateImage = async (prompt, generator) => {
    let imageUrl;
    
    if (generator === 'dalle2') {

        const response  = await openAi.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        imageUrl = response.data.data[0].url;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `dl2_${excerpt}_${timestamp}.png`;
        await downloadFile(imageUrl, imageDirectory + '/' + filename);
        console.log(`Image saved as ${filename}`);

    } else if (generator === 'replicate') {

        try{
            
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            
            const model = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
            const input = { prompt: prompt };
            
            let output = null;

            while (output === null) {
                output = await replicate.run(
                    model, 
                    { 
                        input, 
                        width: 1024, 
                        height: 1024, 
                        num_outputs: 1,
                        num_iterations: 50,
                        guidance_scale: 10.5,
                        num_inference_steps: 70,
                        negative_prompt: 'duplicate heads bad anatomy blurry fog soft blur haze painted illustration duplicate animals',
                        scheduler: 'K_EULER_ANCESTRAL',
                    });

                if (output === null) {
                    console.log('Waiting for output...');
                    await sleep(1000); // Sleep for 1 second
                }
            }

            imageUrl = output[0];
            const excerpt = sanitizeFilename(prompt);
            const timestamp = Date.now();
            const filename = `rp_${excerpt}_${timestamp}.png`;
            await downloadFile(imageUrl, imageDirectory + '/' + filename);
            console.log(`Image saved as ${filename}`);

        }catch (error) {
            console.error('Error calling Replicate API:', error.message);
            return;
        }
        
    } else if (generator === 'future-diffusion') {

        try{
            
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            
            const model = "cjwbw/future-diffusion:b5c46a3b3f0db2a154d4be534ba7758caded970b748a2e26e6d02e9b3bd7da2a";
            const input = { prompt: prompt };
            
            let output = null;

            while (output === null) {
                output = await replicate.run(
                    model, 
                    { 
                        input, 
                        width: 512, 
                        height: 704, 
                        num_outputs: 1,
                        num_iterations: 50,
                        guidance_scale: 7,
                        num_inference_steps: 20,
                        negative_prompt: 'duplicate heads bad anatomy blurry fog soft blur haze painted illustration',
                        scheduler: 'K_EULER_ANCESTRAL',
                    });

                if (output === null) {
                    console.log('Waiting for output...');
                    await sleep(1000); // Sleep for 1 second
                }
            }

            imageUrl = output[0];
            const excerpt = sanitizeFilename(prompt);
            const timestamp = Date.now();
            const filename = `fd_${excerpt}_${timestamp}.png`;
            await downloadFile(imageUrl, imageDirectory + '/' + filename);
            console.log(`Image saved as ${filename}`);

        }catch (error) {
            console.error('Error calling Replicate API:', error.message);
            return;
        }

    } else if(generator === 'midjourney') {
        
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "tstramer/midjourney-diffusion:436b051ebd8f68d23e83d22de5e198e0995357afef113768c20f0b6fcef23c8b";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    width: 1024, 
                    height: 1024, 
                    num_outputs: 1,
                    num_iterations: 90,
                    guidance_scale: 9,
                    num_inference_steps: 52,
                    negative_prompt: 'duplicate heads bad anatomy blurry fog soft painted illustration',
                    scheduler: 'K-K_EULER_ANCESTRAL',
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        console.log(output[0]);

        imageUrl = output[0];
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `mj_${excerpt}_${timestamp}.png`;
        await downloadFile(imageUrl, imageDirectory + '/' + filename);
        console.log(`Image saved as ${filename}`);
    
    } else if(generator === 'ai-forever') {
        
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "ai-forever/kandinsky-2:65a15f6e3c538ee4adf5142411455308926714f7d3f5c940d9f7bc519e0e5c1a";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    width: 1024, 
                    height: 1024, 
                    num_outputs: 1,
                    num_iterations: 90,
                    guidance_scale: 4,
                    prior_cf_scale: 4,
                    prior_steps: 5,
                    num_inference_steps: 101,
                    negative_prompt: 'duplicate heads bad anatomy blurry fog soft painted illustration duplicate animals',
                    scheduler: 'p_sampler',
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        console.log(output);

        imageUrl = output;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `af_${excerpt}_${timestamp}.png`;
        await downloadFile(imageUrl, imageDirectory + '/' + filename);
        console.log(`Image saved as ${filename}`);

    } else {
        console.log("Invalid generator choice. Please enter 'dalle2' or 'midjourney' or 'replicate' or 'future-diffusion or 'ai-forever'.", error.message);
        return;
    }
};

// Generate video from prompt
const generateVideo = async (prompt, generator) => {
    let videoUrl;
    let finished = false;

    if (generator === 'openjourney') {

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "wcarle/text2video-zero-openjourney:2bf28cacd1f02765bd557294ec53f743b42be123675773c810bb3e0f8e3ce6f6";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    chunk_size: 8,
                    motion_field_strength_x: 12,
                    motion_field_strength_y: 12,
                    t0: 44,
                    t1: 45,
                    resolution: 512,
                    video_length: 30,
                    fps: 8,
                    negative_prompt: 'duplicate heads bad anatomy blurry fog soft painted illustration'
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        //console.log(output);

        videoUrl = output;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `oj_${excerpt}_${timestamp}.mp4`;
        await downloadFile(videoUrl, videoDirectory + '/' + filename);
        //console.log(`Video saved as ${filename}`);
        finished = true;
    }
    else if(generator === 'damo'){

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "cjwbw/damo-text-to-video:1e205ea73084bd17a0a3b43396e49ba0d6bc2e754e9283b2df49fad2dcf95755";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    num_frames: 45,
                    num_inference_steps: 47,
                    fps: 8
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        //console.log(output);

        videoUrl = output;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `damo_${excerpt}_${timestamp}.mp4`;
        await downloadFile(videoUrl, videoDirectory + '/' + filename);
        //console.log(`Video saved as ${filename}`);
        finished = true;
    }
    else if(generator === 'stable-diffusion'){

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "wcarle/stable-diffusion-videos-openjourney:bd5fd4290fc2ab4b6931c90aee17581a62047470422737e035f34badb8af4132";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    num_steps: 100,
                    guidance_scale: 7.5,
                    num_inference_steps: 50,
                    seeds: 42 | 1337,
                    fps: 15
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        //console.log(output);

        videoUrl = output;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `sd_${excerpt}_${timestamp}.mp4`;
        await downloadFile(videoUrl, videoDirectory + '/' + filename);
        //console.log(`Video saved as ${filename}`);
        finished = true;
    }
    else if(generator === 'mo-di'){

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const model = "wcarle/stable-diffusion-videos-mo-di:5c3d74439416de290f1d1c9b379c5364c131e69a2823c26a63f2a88fa95f3204";
        const input = { prompt: prompt };

        let output = null;

        while (output === null) {
            output = await replicate.run(
                model, 
                { 
                    input, 
                    num_steps: 100,
                    guidance_scale: 7.5,
                    num_inference_steps: 50,
                    seeds: 1 | 2,
                    fps: 15,
                    scheduler: 'klms'
                });

            if (output === null) {
                console.log('Waiting for output...');
                await sleep(1000); // Sleep for 1 second
            }
        }
        //console.log(output);

        videoUrl = output;
        const excerpt = sanitizeFilename(prompt);
        const timestamp = Date.now();
        const filename = `modi_${excerpt}_${timestamp}.mp4`;
        await downloadFile(videoUrl, videoDirectory + '/' + filename);
        //console.log(`Video saved as ${filename}`);
        finished = true;
    }
    return finished;
}


// Show conversation history
const displayLast10Array  = () => {
    const lastIndex = conversationHistory.length - 1;
    const startIndex = Math.max(0, lastIndex - 9);
    const last10Array = conversationHistory.slice(startIndex);

    console.log('\n');
    console.log('Conversation History');
    console.log('----------------------------------------------------------------------------');

    last10Array.forEach((message, index) => {
        console.log(`${index + 1}. ${message.role}: ${message.content}`);
    });
    console.log('\n');
};

// Get a Timestamp
const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

// Save conversation history to file
const saveHistoryToFile = async () => {
    const timestamp = getTimestamp();
    const filename = historyDirectory + '/' + `conversation_history_${timestamp}.txt`;
    const content = conversationHistory.map(message => `[${message.role}]: ${message.content}`).join('\n');

    // Write the conversation history to a file
    try{
        fs.writeFileSync(filename, content);
        console.log(`Conversation history saved to ${filename}`);
        console.log('\n');
    }
    catch (err) {
        if (err) {
            console.error('Error writing conversation history to file:', err);
            console.log('\n');
        }
        return false;
    }
    return true;
};

// Prompt the User
userInterface.prompt();

// Listen for User Input
userInterface.on('line', async (input) => {

    if(input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        userInterface.close();
        process.exit();
    }   

    if (input.trim().toLowerCase() === 'history') {
        displayLast10Array();
        userInterface.prompt();
        return;
    }

    if (input.trim().toLowerCase() === 'save') {
        const result = saveHistoryToFile();
        if (result) {
            userInterface.prompt();
        }
        return;
    }
    
    if(input.trim().toLowerCase() === 'video') {
        userInterface.question('Enter your video prompt: ', async (prompt) => {
            userInterface.question("Choose the generator ('openjourney' or 'damo' or 'stable-diffusion' or 'mo-di'): ", async (generator) => {
                
                const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

                console.log('\n');
                const ora = (await import('ora')).default;
                const spinner = ora().start();
                spinner.text = null;
                spinner.color = 'yellow';
                spinner.spinner = 'sand';
                spinner.text = 'Retrieving your video\n';

                await sleep(8000); // Sleep for 8 seconds

                spinner.text = null;
                spinner.color = 'red';
                spinner.spinner = 'arc';
                spinner.text = 'Spinning up cloud server.\n';
                await sleep(9000); // Sleep for 9 seconds

                spinner.text = null;
                spinner.color = 'green';
                spinner.spinner = 'growHorizontal';
                spinner.text = 'Generating video on AI server. This could take 3 to 5 minutes to process.\n';
                await sleep(3000); // Sleep for 3 seconds
                spinner.text = null;
                

                let output = null;

                while (output === null) {
                    output = await generateVideo(prompt, generator.toLowerCase());

                    if (output === null) {
                        await sleep(1000); // Sleep for 1 second
                    }
                    else{
                        spinner.text = null;
                        await sleep(3000); // Sleep for 3 seconds
                    }
                } 

                spinner.stop();

                console.log('\n');
                console.log('Your video was generated successfully!');
                console.log('\n');

                // Prompt the user for the next question
                userInterface.prompt();
            });
        });
    }  
    else if (input.trim().toLowerCase() === 'image') {

        userInterface.question('Enter your image prompt: ', async (prompt) => {
            userInterface.question("Choose the generator ('dalle2' or 'midjourney or replicate or future-diffusion or ai-forever'): ", async (generator) => {

                console.log('\n');
                const ora = (await import('ora')).default;
                const spinner = ora().start();
                spinner.color = 'yellow';
                spinner.spinner = 'sand';
                spinner.text = 'Retrieving your image\n';

                await generateImage(prompt, generator.toLowerCase());
                spinner.stop();
                console.log('\n');
                console.log('Your image was generated successfully!');
                console.log('\n');

                // Prompt the user for the next question
                userInterface.prompt();
            });
        });

    } else {

        console.log('\n');
        const ora = (await import('ora')).default;
        const spinner = ora('Processing your prompt...\n').start();
        spinner.color = 'yellow';
        spinner.spinner = 'dots';

        // Add the user's input to the conversation history
        conversationHistory.push({ role: 'user', content: input.trim() });
        
        try{

            const response = await openAi.createChatCompletion({
                // gpt-3.5-turbo is the model used by ChatGPT
                // gpt-3.5-turbo-0301 is the model used by ChatGPT
                model: 'gpt-3.5-turbo-0301',
                messages: conversationHistory,
                
            });
            
            // Stop the spinner
            spinner.stop();
            spinner.clear();
            console.log('\n');
    
            // Display ChatGPT's response
            const { default: chalk } = await import('chalk');
            console.log(chalk.blackBright(response.data.choices[0].message.content));
            console.log('\n');
    
            // Add ChatGPT's response to the conversation history
            conversationHistory.push({ role: 'assistant', content: response.data.choices[0].message.content });

        }catch(error){
            // Stop the spinner
            spinner.stop();
            spinner.clear();
            console.log('\n');
            if (error.response && error.response.data && error.response.data.error) {
                console.error(chalk.red(`Error: ${error.response.data.error.message}`));
            } else {
                console.error(chalk.red(`Error: ${error.message}`));
            }
            console.log('\n');
        }finally{
            // Prompt the user for the next question
            userInterface.prompt();
        }
        
    }
    
    // Prompt the user for the next question
    userInterface.prompt();
});
