require('dotenv').config()
const client = require('twitter-api-client')
const axios = require('axios')
const fs = require('fs')
const jimp = require('jimp')

const TWITTER_HANDLE = 'heySachin23'

let image_urls = []

const twitterClient = new client.TwitterClient({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

// async function test() {
//     const params = {
//         screen_name : 'heySachin23',
//         count : 3
//     }
//     const data = await twitterClient.accountsAndUsers.followersList(params)
//     console.log(data)
// }

// test()    

const download_image = (url, image_path) => {
    axios({
        url,
        responseType: 'stream'
    }).then(
        response => 
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve)
                    .on('error', e => reject())
            })
    )
}

async function drawImage(banner, img1, img2, img3, img4, img5) {
    let imgArr = [banner, img1, img2, img3, img4, img5]
    let jimps = [];

    imgArr.forEach(image => jimps.push(jimp.read(image)));
    console.log('drawing image')
    Promise.all(jimps).then(data => {
        return Promise.all(jimps)
    }).then(data => {
        console.log('inside promise')
        data[0].composite(data[1].resize(80, 80), 840, 394)
        data[0].composite(data[2].resize(80, 80), 950, 394)
        data[0].composite(data[3].resize(80, 80), 1060, 394)
        data[0].composite(data[4].resize(80, 80), 1170, 394)
        data[0].composite(data[5].resize(80, 80), 1280, 394)

        data[0].write('banner-1500x500.png', () => {
            console.log("done");
        })
    })
    const base64 = await fs.readFileSync('banner-1500x500.png', { encoding: 'base64' });
    await twitterClient.accountsAndUsers.accountUpdateProfileBanner({banner: base64});
}

async function start() {
    const name = Math.random();
    let lastDrawImage = 0;
    const params = {
        screen_name : TWITTER_HANDLE,
        count : 5
    }
    const followersData = await twitterClient.accountsAndUsers.followersList(params)
    const users = await followersData.users
    for(let idx=0; idx<5; idx++) {
        image_urls.unshift(users[idx].profile_image_url_https)
    }

    (async () => {
        await download_image(image_urls[0], `${name}-1.png`)
        await download_image(image_urls[1], `${name}-2.png`)
        await download_image(image_urls[2], `${name}-3.png`)
        await download_image(image_urls[3], `${name}-4.png`)
        await download_image(image_urls[4], `${name}-5.png`)
        async function drawIt() {
            lastDrawImage = Date.now()
            await drawImage('banner-1500x500.png', `${name}-1.png`, `${name}-2.png`, `${name}-3.png`, `${name}-4.png`, `${name}-5.png`)
        }

        async function deleteImages() {
            try {
                console.log('removing images')
                for(let i=1; i<6; i++) {
                    await fs.unlinkSync(`${name}-${i}.png`)
                }
            } catch(e) {
                console.log(e)
            }
        }

        setTimeout(async () => {
            await drawIt();
            await deleteImages();
        }, 2000)
    })();
}

start();
setInterval(() => {
    start(); 
  }, 60000);
