import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // Used to parse JSON bodies

const port = 3000;

// Get environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();
// Get Cosmos Client
import { CosmosClient } from "@azure/cosmos";

// Provide required connection from environment variables
// const key = process.env.COSMOS_KEY;
const key = "odJqogS7XEVqDVLh2OlDAvy2dnOVopQh2YojbjQEgVcSZZ7hhfJuB6ej47D3Sf8ScmdlZfMcXmABACDbmzjmvw==";
// Endpoint format: https://YOUR-RESOURCE-NAME.documents.azure.com:443/
// const endpoint = process.env.COSMOS_ENDPOINT;
const endpoint = "https://lwetheng.documents.azure.com:443/";

// Uniqueness for database and container
const timeStamp = + new Date();

// Set Database name and container name with unique timestamp
const databaseName = "url-shortener";
const containerName = "url-mapping";
const partitionKeyPath = ["/long_url"]

const cosmosClient = new CosmosClient({ endpoint, key });

const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseName });
console.log(`${database.id} database ready`);

// Create container if it doesn't exist
const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
        paths: partitionKeyPath
    }
});
console.log(`${container.id} container ready`);


var _alphabet = '23456789bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ-_';
var _base = _alphabet.length;
var id = "1000";

app.get('/', function(request, response){
    response.sendFile('index.html', { root: __dirname });
});

app.get('/test', function(request,response){
    console.log(request.headers.origin)
    response.append('Access-Control-Allow-Origin', "*");
    response.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.append('Access-Control-Allow-Headers', 'Content-Type')
    response.append('Access-Control-Request-Headers', '*');
    
    response.send({msg: "YOU CALLED ME " + request.headers.origin});
})

app.post('/url-shorten', async function(request, response, next){
    var longUrl = request.body.longUrl;
    // var shortUrl = "";
    var shortUrl = longUrl;
    // for(var i = 0; i < longUrl.length; i++){
    //     var char = longUrl.charCodeAt(i);
    //     shortUrl += char;

    // }
    // shortUrl = shortenURL(shortUrl);
    var item =  {
                "id": id,
                "url": longUrl,
                "long_url": "category",
            }
    console.log("LONG URL: ", longUrl);

    try{
        const {resource} = await container.items.create(item);
        // console.log(`'${resource.name}' inserted`);
        console.log(resource);
    }
    catch(error){
        next(error)
        return;
    }
    var outputMsg = "Short URL Created: " + id;
    id = parseInt(id) + 1;
    id += "";
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.set('Access-Control-Allow-Headers', 'Content-Type')
    response.set('Access-Control-Allow-Credentials', 'false')
    response.send({output: outputMsg});
})

app.post('/url-lengthen', async function(request, response, next){
    var shortUrl = request.body.shortUrl + "";
    // shortUrl = lengthenURL(shortUrl);
    var longUrl = "Failed";
    // for(var i = 0; i < shortUrl.length; i++){
    //     var char = shortUrl.fromCharCode(i);
    //     longUrl += char;

    // }
    // console.log(longUrl);

    try{
        const {resource} = await container.item(shortUrl, "category").read();
        console.log(resource);
        console.log(`'${resource.name}' read`);
        longUrl = resource.url;
    }
    catch(error){
        next(error)
    }
    finally{
        response.set('Access-Control-Allow-Origin', '*')
        response.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.set('Access-Control-Allow-Headers', 'Content-Type')
        response.set('Access-Control-Allow-Credentials', 'false')
        response.send("Long URL retrieved: " + longUrl)
        
    }
    // return "URL successfully shortened: " + shortUrl;
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function shortenURL(num){
    var str = '';
    while (num > 0) {
        str = _alphabet.charAt(num % _base) + str;
        num = Math.floor(num / _base);
    }
    return str;
}

function lengthenURL(str){
    var num = 0;
    for (var i = 0; i < str.length; i++) {
        num = num * _base + _alphabet.indexOf(str.charAt(i));
    }
    return num;
}

// Data items
// const items = [
//     {
//         "id": "08225A9E-F2B3-4FA3-AB08-8C70ADD6C3C2",
//         "categoryId": "75BF1ACB-168D-469C-9AA3-1FD26BB4EA4C",
//         "categoryName": "Bikes, Touring Bikes",
//         "sku": "BK-T79U-50",
//         "name": "Touring-1000 Blue, 50",
//         "description": "The product called \"Touring-1000 Blue, 50\"",
//         "price": 2384.0700000000002,
//         "tags": [
//             {
//                 "_id": "27B7F8D5-1009-45B8-88F5-41008A0F0393",
//                 "name": "Tag-61"
//             }
//         ]
//     },
//     {
//         "id": "2C981511-AC73-4A65-9DA3-A0577E386394",
//         "categoryId": "75BF1ACB-168D-469C-9AA3-1FD26BB4EA4C",
//         "categoryName": "Bikes, Touring Bikes",
//         "sku": "BK-T79U-46",
//         "name": "Touring-1000 Blue, 46",
//         "description": "The product called \"Touring-1000 Blue, 46\"",
//         "price": 2384.0700000000002,
//         "tags": [
//             {
//                 "_id": "4E102F3F-7D57-4CD7-88F4-AC5076A42C59",
//                 "name": "Tag-91"
//             }
//         ]
//     },
//     {
//         "id": "0F124781-C991-48A9-ACF2-249771D44029",
//         "categoryId": "56400CF3-446D-4C3F-B9B2-68286DA3BB99",
//         "categoryName": "Bikes, Mountain Bikes",
//         "sku": "BK-M68B-42",
//         "name": "Mountain-200 Black, 42",
//         "description": "The product called \"Mountain-200 Black, 42\"",
//         "price": 2294.9899999999998,
//         "tags": [
//             {
//                 "_id": "4F67013C-3B5E-4A3D-B4B0-8C597A491EB6",
//                 "name": "Tag-82"
//             }
//         ]
//     }
// ];

// // Create all items
// for (const item of items) {
    
//     const { resource } = await container.items.create(item);
//     console.log(`'${resource.name}' inserted`);
// }

// const { resource } = await container.item(items[0].id, items[0].categoryName).read();
// console.log(`${resource.name} read`);

console.log("YOU STARTED URL-SHORTENER")
