/**
 * Imports from Discord
 * and JsonDB from basic data_base
 */

import Discord, { Message, MessageEmbed, MessageReaction } from 'discord.js';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

import path from 'path'
import fs from 'fs'
import { O_NONBLOCK } from 'constants';
import { MessageChannel } from 'worker_threads';
const card_info = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../cads/cardinfo.json"),"utf-8"))
//import card_info from '../cads/cardinfo.json'

/*
 * prefix for messages bot's C! --> change ph'ps
 * Map ... for do functions...? 
 */

let db = new JsonDB(new Config("card", true, true, '/'));
let prefix = "C!";
let cmds = new Map;

cmds.set("ping", (message:Discord.Message, args:string[])=>{
return message.reply("POING!");
})

cmds.set("cls", (message:Discord.Message, args:string[])=>{
    if(Number(args[1]) <= 100 && Number(args[1]) > 0)
    {
        message.channel.messages.channel.bulkDelete(Number(args[1])).then(ret=>{
            console.log(`Messagens apagadas ${ret.size}`);
        })
    }else
    {
        message.channel.send("KKKKKK OTARIO ESCREVE SA BOSTA DIREITO MANÉ - C!cls NUMERO > 0 e < 100");
    }

})

/*
Nome
Estrela
---
ATK
DEF
--
Efeito -> HOW I DOE THAT!?
*/

//{"id":83994646,"name":"4-Starred Ladybug of Doom","type":"Flip Effect Monster","desc":"FLIP: Destroy all Level 4 monsters your opponent controls.","atk":800,"def":1200,"level":3,"race":"Insect","attribute":"WIND","card_sets":[{"set_name":"Dark Beginning 1","set_code":"DB1-EN198","set_rarity":"Common","set_rarity_code":"(C)","set_price":"1.12"},{"set_name":"Pharaoh's Servant","set_code":"PSV-088","set_rarity":"Common","set_rarity_code":"(C)","set_price":"1.01"},{"set_name":"Pharaoh's Servant","set_code":"PSV-E088","set_rarity":"Common","set_rarity_code":"(C)","set_price":"3.45"},{"set_name":"Pharaoh's Servant","set_code":"PSV-EN088","set_rarity":"Common","set_rarity_code":"(C)","set_price":"0.00"},{"set_name":"Retro Pack 2","set_code":"RP02-EN022","set_rarity":"Common","set_rarity_code":"(C)","set_price":"1.23"},{"set_name":"Starter Deck: Yugi Reloaded","set_code":"YSYR-EN010","set_rarity":"Common","set_rarity_code":"(C)","set_price":"1.1"}],"card_images":[{"id":83994646,"image_url":"https://storage.googleapis.com/ygoprodeck.com/pics/83994646.jpg","image_url_small":"https://storage.googleapis.com/ygoprodeck.com/pics_small/83994646.jpg"}],"card_prices":[{"cardmarket_price":"0.07","tcgplayer_price":"0.12","ebay_price":"2.00","amazon_price":"0.25","coolstuffinc_price":"0.39"}]},

interface cards {
    id:number
    name:string
    type:string
    desc:string
    atk:number
    def:number
    level:number
    race:string
    archetype:string
    card_image:string[]
    card_piece:string[]
}

interface duelista{
    deck: string[],
    pb: number,
}


cmds.set("loja", (message:Discord.Message, args: string[]) => {
    return message.channel.send("Compra pack de cartas 1 = 5 cartas vale 500 pb, 1 = 20 cartas vale 3000 pb ").then(async msg =>{
        await msg.react("💸")
        await msg.react("💰")
        let user : duelista = db.getData(`/${message.author.id}`);


           
        const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '💸' ||  reaction.emoji.name === '💰' && user.id === message.author.id;
        const collector = msg.createReactionCollector(filter,{time:60000})
        collector.once("collect", async (obj:MessageReaction, User: Discord.User)=>{
            await msg.reactions.removeAll();
            if(obj.emoji.name == '💸'){

                const dk = user.deck;
                for(let i = 0; i < 10; i++)
                dk.push(card_info.data[Math.floor(Math.random()*card_info.data.length)].name);
                

                //dk.push(user.deck);
                
                db.push(`/${message.author.id}`,
                {
                    "deck":dk
                })
                return msg.edit("Consumiu 500 pb")
            }else if(obj.emoji.name == '💰'){
                return msg.edit("consumiu 3000 pb");
            }
        })
    })
})


cmds.set("jokepo", (message:Discord.Message, args: string[]) => {
    return message.channel.send("Compra pack de cartas 1 = 5 cartas vale 500 pb, 1 = 20 cartas vale 3000 pb ").then(async msg =>{
        await msg.react("💸")
        await msg.react("💰")
        let user : duelista = db.getData(`/${message.author.id}`);

        var server = message.guild;
        var name = message.author.username;
    
        M
        server.createChannel(name, "text");
    

           
        const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '💸' ||  reaction.emoji.name === '💰' && user.id === message.author.id;
        const collector = msg.createReactionCollector(filter,{time:60000})
        collector.once("collect", async (obj:MessageReaction, User: Discord.User)=>{
            await msg.reactions.removeAll();
            if(obj.emoji.name == '💸'){

                const dk = user.deck;
                for(let i = 0; i < 10; i++)
                dk.push(card_info.data[Math.floor(Math.random()*card_info.data.length)].name);
                
                
                //dk.push(user.deck);
                
                db.push(`/${message.author.id}`,
                {
                    "deck":dk
                })
                return msg.edit("Consumiu 500 pb")
            }else if(obj.emoji.name == '💰'){
                return msg.edit("consumiu 3000 pb");
            }
        })
    })
})

function card(id:String, idx:number)
{
    let user : duelista = db.getData(`/${id}`);
    let this_card = card_info.data.find((c:any) => c.name.toLowerCase() == user.deck[idx].toLowerCase() )

    const embed =  new MessageEmbed();
    if(!this_card)
    return (`carta ${user.deck[0]} nao encontrada`);
        embed.setTitle(this_card.name)
        embed.setDescription(this_card.desc)
        embed.addFields([
            {
                name:"TYPE",
                value:this_card.type, inline:true
            },
            {
                name:"RACE",
                value:this_card.race, inline:true
            },
            {
            name:"ATTRIBUTE",
            value:this_card.attribute, inline:true
            }
        ])
        if(this_card.level)
        {
            embed.addFields([
                {
                    name:"LEVEL",
                    value:this_card.level, inline:true
                },
                {
                    name:"ARCHETYPE",
                    value:this_card.archetype, inline:true
                },
                {
                    name:"ATK",
                    value:this_card.atk, inline:true
                },
                {
                name:"DEF",
                value:this_card.def, inline:true // por na mesma linha
                }
            ])
        }
        embed.setThumbnail(this_card.card_images[0].image_url);
    return embed
}

cmds.set("deck", (message:Discord.Message, args: string[]) => {

    let user : duelista = db.getData(`/${message.author.id}`);
    let max_cards_deck  = user.deck.length;
    let index_now = 0;
    if(user.deck.length)
    {
        return message.channel.send(card(message.author.id, 0)).then(async msg =>{
            await msg.react("⬅️")
            await msg.react("➡️")

            const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '⬅️' ||  reaction.emoji.name === '➡️' && user.id === message.author.id;
            const collector = msg.createReactionCollector(filter,{time:60000})
            collector.on("collect", async (obj:MessageReaction, User: Discord.User)=>{

                if(obj.emoji.name == '⬅️')
                {
                    if(index_now > 0)
                    index_now--;
                    else
                    index_now = (max_cards_deck-1)
                }
                else if(obj.emoji.name == '➡️')
                {
                    if(index_now < max_cards_deck-1)
                    index_now++;
                    else
                    index_now = 0
                }
                if(obj.count)
                    obj.users.remove(message.author.id)

                return msg.edit(card(message.author.id, index_now))
            })
        })
    }
})



cmds.set("cadastro", async (message:Discord.Message, args: string[]) => {
    await message.channel.send("BEM VINDO DUELISTA!!! diga seu nome: ");
    const filtro  = (m: Discord.Message) =>  m.author.id == message.author.id;
    
    await message.channel.awaitMessages(filtro,  { max: 1, time: 50000, errors: ["time"] }).then( async(collect) => {
        let parametros = collect.first()
        message.channel.send(`${parametros?.content} Eae duelista! você começa com apenas um deck e 500pb`);

        const dk = [];
        for(let i = 0; i < 10; i++)
           dk.push(card_info.data[Math.floor(Math.random()*card_info.data.length)].name);
        

        db.push(`/${parametros?.author.id}`,
        {
            "deck":dk,
            "pb":500
        }
        )
    })
})

cmds.set("abc", (message:Discord.Message, args: string[]) => 
{
    let this_card = card_info.data.find((c:any) => c.id == Number(args[1]) || c.name.toLowerCase() == args[1].replace(/\_/g, ' ').toLowerCase() ) // c.id == Number(args[1]) || (c.name && c.name?.toLowerCase() == args[1].toLowerCase())

    if(!this_card)
    return message.channel.send("Nao achei essa carta");

    const embed = new MessageEmbed()
    .setTitle(this_card.name)
    .setColor(0xff0000)
    .setDescription(this_card.desc)
    .addFields([
        {
            name:"ESTRELAS",
            value:this_card.level, inline:true
        },
        {
            name:"ATK",
            value:this_card.atk, inline:true
        },
        {
          name:"DEF",
          value:this_card.def, inline:true // por na mesma linha
        }

    ])
    .setThumbnail(this_card.card_images[0].image_url);
  return message.channel.send(embed);

})

cmds.set("show_cards", async (message:Discord.Message, args: string[]) => {
    await message.channel.send("Suas cartas");
    let user : duelista = db.getData(`/${message.author.id}`);
    const embeds: MessageEmbed[] =[]; //=  new MessageEmbed();
    for(let i = 0; i < user.deck.length; ++i)
    {
        let this_card = card_info.data.find((c:any) => c.id == Number(args[1]) || c.name.toLowerCase() == user.deck[i].toLowerCase() ) // c.id == Number(args[1]) || (c.name && c.name?.toLowerCase() == args[1].toLowerCase())


        if(!this_card)
        return message.channel.send(`carta ${user.deck[i]} nao encontrada`);

        const embed =  new MessageEmbed();
        embed.setTitle(this_card.name)
        embed.setDescription(this_card.desc)
        embed.addFields([
            {
                name:"TYPE",
                value:this_card.type, inline:true
            },
            {
                name:"RACE",
                value:this_card.race, inline:true
            },
            {
               name:"ATTRIBUTE",
               value:this_card.attribute, inline:true
            }
    
        ])

        if(this_card.level)
        {
            embed.addFields([
                {
                    name:"LEVEL",
                    value:this_card.level, inline:true
                },
                {
                    name:"ARCHETYPE",
                    value:this_card.archetype, inline:true
                },
                {
                    name:"ATK",
                    value:this_card.atk, inline:true
                },
                {
                   name:"DEF",
                   value:this_card.def, inline:true // por na mesma linha
                }
        
            ])
        }
        embed.setThumbnail(this_card.card_images[0].image_url);
        embeds.push(embed);
    }
   
    if(message.channel.type == "dm")
    return;

    return message.channel.createWebhook('Webhook Name')
    .then(w => w.send({embeds}));
})



cmds.set("show_pb", async (message:Discord.Message, args: string[]) => {
    await message.channel.send("Suas pbs");
    let user : duelista = db.getData(`/${message.author.id}`);
    message.channel.send(user.pb);
})

cmds.set("Transferir_PB_para", async (message:Discord.Message, args: string[]) => {
    let user : duelista = db.getData(`/${message.author.id}`);
    let to_user = message.mentions.members?.first()?.id || args[1];

    if(user.pb >= Number(args[2]))
    {
        db.push(`/${message.author.id}/pb`, user.pb - Number(args[2]), true)
        db.push(`/${to_user}/pb`, user.pb + Number(args[2]), true)
        db.save()
        message.channel.send("ENVIADO COM SUCESSO");
    }
    //console.log(message.content);
})


cmds.set("usar", (message:Discord.Message, args: string[]) => {
    let name_card = args.join(" ").slice(args[0].length+1) // pega nome apos chamada de função "usar "
    let card:cards = db.getData(`/${name_card}`); 
   
    console.log(card.level);
    console.log(name_card);

        const embed = new MessageEmbed()
          .setTitle(name_card)
          .setColor(0xff0000)
          .setDescription(card.desc)
          .addFields([
              {
                  name:"ESTRELAS",
                  value:card.level, inline:true
              },
              {
                  name:"ATK",
                  value:card.atk, inline:true
              },
              {
                name:"DEF",
                value:card.def, inline:true // por na mesma linha
              }

          ])
          .setThumbnail(card.card_image[0]);
        return message.channel.send(embed);
})


/*
cmds.set("init_cards", (message:Discord.Message, args:string[]) => {

    db.push("/Mago Negro", {
        "Estrela":7,
        "ATK":2500,
        "DEF":2100,
        "EFEITO":"O mago definitivo em termos de ataque e defesa."
    });
})
*/

export default (client: Discord.Client, message: Discord.Message) => {

    if (message.content.startsWith(prefix)) {

        message.content = message.content.slice(prefix.length);
        let msg_args = message.content.trim().split(" ");


        console.log(msg_args[0]);
        cmds.get(msg_args[0])(message, msg_args);

    }
}