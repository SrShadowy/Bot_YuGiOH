/**
 * Imports from Discord
 * and JsonDB from basic data_base
 */

import Discord, { Message, MessageEmbed, MessageReaction } from 'discord.js';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

import path from 'path'
import fs, { createReadStream } from 'fs'
import { O_NONBLOCK } from 'constants';
import { MessageChannel } from 'worker_threads';
import { allowedNodeEnvironmentFlags } from 'process';
import { Console } from 'console';
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
    attribute:string
    "card_images": [
        {
            "id":number
            "image_url": string
            "image_url_small": string
        }
    ]
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


cmds.set("jokepo", async (message:Discord.Message, args: string[]) => {
    message.channel.send("Criando os chats!")
        let user : duelista = db.getData(`/${message.author.id}`);
        var name = message.author.username;
        let to_user = message.mentions.members?.first()?.id || args[1];
        if(!to_user)
        return message.channel.send("Opa não conseguir encontrar esse usuario");

        let jokepo_msg = ("ESCOLHA PEDRA PAPEL OU TESOURA!");
        let firstchnl =  await message.guild?.channels.create(name, {
            permissionOverwrites: [{
                id: message.guild.id,
                deny: ["VIEW_CHANNEL"]

            },{
                id: message.author.id,
                allow: ["VIEW_CHANNEL"]

            }],
            type:"text",
        })
        let sec_user = message.guild?.members.cache.get(to_user)?.user.username || args[1];
       let secchnl = await message.guild?.channels.create(sec_user, {
            type:"text",
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: to_user,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        })
        if(secchnl && firstchnl)
        {
            let first_player = 0;
            let sec_player = 0;

            const check = () => {
                jokepo_msg = "";

                if(first_player == sec_player && first_player > 0 && sec_player > 0)
                {
                    jokepo_msg = "EMPATE!";
                    // empate
                }else if (first_player > 0 && sec_player > 0){
                    switch(first_player)
                    {
                        case 1: // pedra
                            if(sec_player == 2)
                            {
                                jokepo_msg = message.author.username + " perdeu!";
                            }else if(sec_player == 3)
                            {
                                jokepo_msg = message.author.username + " ganhou!";
                            }
                            break;
                        case 2: // papel
                            if(sec_player == 1)
                            {
                                jokepo_msg = message.author.username + " ganhou!";
                            }
                            else if(sec_player == 3)
                            {
                                jokepo_msg = message.author.username + " perdeu!";
                            }
                            break;
                        case 3: // tesoura
                            if(sec_player == 1)
                            {
                                jokepo_msg = message.author.username + " perdeu!";
                            }
                            else if(sec_player == 2)
                            {
                                jokepo_msg = message.author.username + " ganhou!";
                            }
                            break;
                        default:
                            break;
                    }
                }
                if(firstchnl && first_player > 0)
                message.guild?.channels.cache.get(firstchnl?.id)?.delete();
        
                if(secchnl && sec_player > 0)
                message.guild?.channels.cache.get(secchnl?.id)?.delete();
                if(jokepo_msg.length > 0)
                return message.channel.send(jokepo_msg);
            }

            firstchnl.send(jokepo_msg).then(async msg =>{
                await msg.react("🥌")
                await msg.react("🗞️")
                await msg.react("💇‍♂️")
                
                const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '🥌' ||  reaction.emoji.name === '🗞️' || reaction.emoji.name === '💇‍♂️' && user.id === message.author.id;
                const collector = msg.createReactionCollector(filter,{time:60000})
                collector.once("collect", async (obj:MessageReaction, User: Discord.User)=>{
                    await msg.reactions.removeAll();
                    if(obj.emoji.name == "🥌")
                    {
                        first_player = 1;
                    }
                    else if(obj.emoji.name == "🗞️")
                    {
                        first_player = 2;
                    }
                    else if(obj.emoji.name == "💇‍♂️")
                    {
                        first_player = 3;
                    }
                    check();
                })
            })

            secchnl.send(jokepo_msg).then(async msg =>{
                await msg.react("🥌")
                await msg.react("🗞️")
                await msg.react("💇‍♂️")
                
                const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '🥌' ||  reaction.emoji.name === '🗞️' || reaction.emoji.name === '💇‍♂️' && user.id === to_user;
                const collector = msg.createReactionCollector(filter,{time:60000})
                collector.once("collect", async (obj:MessageReaction, User: Discord.User)=>{
                    await msg.reactions.removeAll();
                    if(obj.emoji.name == "🥌")
                    {
                        sec_player = 1;
                    }
                    else if(obj.emoji.name == "🗞️")
                    {
                        sec_player = 2;
                    }
                    else if(obj.emoji.name == "💇‍♂️")
                    {
                        sec_player = 3;
                    }
                    check();
                })
            })

        }
        setTimeout(()=>{

            if(firstchnl)
            message.guild?.channels.cache.get(firstchnl?.id)?.delete();
    
            if(secchnl)
            message.guild?.channels.cache.get(secchnl?.id)?.delete();
        }, 60000); 
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

function card_onhend(hand: cards[], indx: number){
    let this_card = hand[indx]

    //console.log(this_card.card_images[0].image_url);

    const embed =  new MessageEmbed();
    if(!this_card)
    return (`carta ${this_card} nao encontrada`);

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
            value:this_card.archetype, inline:true
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



function get_card_by_name(name:string)
{
    let this_card = card_info.data.find((c:any) => c.name.toLowerCase() == name.replace(/\_/g, ' ').toLowerCase() ) // c.id == Number(args[1]) || (c.name && c.name?.toLowerCase() == args[1].toLowerCase())


    if(!this_card)
    return ("Nao achei essa carta");


  return this_card;
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
    console.log(name_card);
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
          //.setThumbnail(card.card_image[0]);
        return message.channel.send(embed);
})




cmds.set("vs", (message:Discord.Message, args: string[]) => {
    let user : duelista = db.getData(`/${message.author.id}`);
    let card_first = get_card_by_name(args[1]);
    if(user.deck.indexOf(card_first.name) != -1)
    {
       
        if(!card_first)
            return message.channel.send("Opa não foi possivel encontrar alguma carta");

        let card_sec = get_card_by_name(args[2]);

        if(!card_sec)
            return message.channel.send("Opa não foi possivel encontrar alguma carta");

        if( card_first.atk > card_sec.atk)
        {
            const embed = new MessageEmbed()
            .setTitle("ganhou " + card_first.name)
            .setColor(0x0000FF)
            .setDescription(card_first.desc)
            .addFields([
                {
                    name:"ESTRELAS",
                    value:card_first.level, inline:true
                },
                {
                    name:"ATK",
                    value:card_first.atk, inline:true
                },
                {
                name:"DEF",
                value:card_first.def, inline:true // por na mesma linha
                }

            ])
            .setThumbnail(card_first.card_images[0].image_url);    

            message.channel.send(embed);
        }else{
            const embed = new MessageEmbed()
            .setTitle("ganhou " + card_sec.name)
            .setColor(0xff0000)
            .setDescription(card_sec.desc)
            .addFields([
                {
                    name:"ESTRELAS",
                    value:card_sec.level, inline:true
                },
                {
                    name:"ATK",
                    value:card_sec.atk, inline:true
                },
                {
                name:"DEF",
                value:card_sec.def, inline:true // por na mesma linha
                }

            ])
            .setThumbnail(card_sec.card_images[0].image_url);    

            return message.channel.send(embed);
        }

    }
    return message.channel.send("Opa não foi possivel encontrar alguma carta");
})



function summor(monster:cards, campo : cards[], player1 : boolean){
    if(monster.type.search("Monster") != -1 ){
    var pos = 0;
        if(monster.level > 4)
            return {
                first: "Monstro precisa de sacrificil use C!summor Monstro Sacrificil",
                second: campo
            };


        
        if(player1)
        {
            //campo[0] = monster;
            for(let i = 0; i < 5; ++i)
            {
                if(!campo[i])
                {
                    pos = i;
                    campo[i] = monster;
                    break;
                }
            }
        }else{
            for(let i = 5; i < 9; ++i)
            {
                if(!campo[i])
                {
                    pos = i;
                    campo[i] = monster;
                    break;
                }
            }

        }
        
        return {
            first: "Você invocou o " + monster.name + " em modo de ataque no quadro " + pos,
            second: campo
        };

    
    }
    return {
        first: "Essa carta não é um monstro!",
        second: campo
    };
}





function getDeck(due:duelista)
{
    let deck : cards[] = []
    let this_card : cards;
    for( let i = 0; i < due.deck.length; ++i)
    {
        this_card = card_info.data.find((c:any) => c.name.toLowerCase() == due.deck[i].toLowerCase());

        deck.push(this_card);
    }
    return deck;
}

function drawn(deck :cards[], hand: cards[])
{   
    hand.push(deck[0]);
    deck.shift();
    return [deck,hand];
}


cmds.set("DUELO!", async (message:Discord.Message, args: string[]) => {

    message.channel.send("É HORA DO DUELO!! Criando chats para cada DUELISTA!")

    let to_user = message.mentions.members?.first()?.id || args[1];

    var x  : duelista = db.getData(`/${message.author.id}`)
    let deck_player1 = getDeck(x);
    x = db.getData(`/${to_user}`);
    let deck_player2 = getDeck(x);


    let hand_player1 : cards[] = [];
    let hand_player2 : cards[] = [];


    let index_1 = 0;
    let index_2 = 0;
    let max_deck1 =5;//deck_player1.length;
    let max_deck2 =5;//deck_player2.length;

    var player_1 = message.author.username;
    var player_2 = message.mentions.members?.first()?.nickname || message.guild?.members.cache.get(to_user)?.user.username; 

    let mesa_monstros : cards[] = [];
    let mesa_efects   : cards[] = [];
    let cemiterio     : cards[] = [];
    let cenario       : cards[] = [];


    if(!to_user)
    return message.channel.send("Opa não conseguir encontrar esse usuario");

    let firstchnl =  await message.guild?.channels.create(player_1, {
        permissionOverwrites: [{
            id: message.guild.id,
            deny: ["VIEW_CHANNEL"]

        },{
            id: message.author.id,
            allow: ["VIEW_CHANNEL"]

        }],
        type:"text",
    })

   let secchnl = await message.guild?.channels.create(player_2 || args[1], {
        type:"text",
        permissionOverwrites: [
            {
                id: message.guild.id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: to_user,
                allow: ["VIEW_CHANNEL"]
            }
        ]
    })


    if(secchnl && firstchnl)
    {

        let play = false;
        let play1 : Discord.Message;
        let play2 : Discord.Message; 


        for(let i = 0; i< 5 ; ++i)
        {
            [deck_player1, hand_player1] = drawn(deck_player1, hand_player1);
            [deck_player2, hand_player2] = drawn(deck_player2, hand_player2);
        }
        //console.log(hand_player1);

        //👻 ⬅️ ➡️ 🖐️ 🎴

        let duel = "começou! e você puxou 5 cartas! "

        firstchnl.send(duel += play? " É a vez do adivesario!" : " É  sua vez").then(async msg =>{
            await msg.react("👻")
            await msg.react("🎴")
            await msg.react("⬅️")
            await msg.react("➡️")
            play1 = msg;
            const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '👻' ||  reaction.emoji.name === '🎴' || reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️' && user.id === message.author.id;
            const collector = msg.createReactionCollector(filter)
            collector.on("collect", async (obj:MessageReaction, User: Discord.User)=>{
                if(obj.emoji.name == "👻")
                {
              
                    var x = summor(hand_player1[index_1], mesa_monstros, !play);
                    mesa_monstros = x.second;
                    msg.edit(x.first);
                    play2.edit("TESTE PLAY1 EDITOU ISSO");
                    //summor()
                }
                else if(obj.emoji.name == "🎴")
                {
                    play2.edit("TESTE PLAY1 EDITOU ISSO");
                    firstchnl?.send("Ainda n tem :( ")
                }
                else if(obj.emoji.name == '⬅️')
                {
                    if(index_1 > 0)
                    index_1--;
                    else
                    index_1 = (max_deck1-1)
                }
                else if(obj.emoji.name == '➡️')
                {
                    if(index_1 < max_deck1-1)
                    index_1++;
                    else
                    index_1 = 0
                }
                if(obj.count)
                obj.users.remove(message.author.id)
                msg.edit(card_onhend( hand_player1, index_1 ));
            
            })
        })

        secchnl.send(duel += play?  " É  sua vez" : " É a vez do adivesario!").then(async msg =>{
            await msg.react("👻")
            await msg.react("🎴")
            await msg.react("⬅️")
            await msg.react("➡️")
            play2 = msg;
            const filter = (reaction:Discord.MessageReaction, user:Discord.User) => reaction.emoji.name === '👻' ||  reaction.emoji.name === '🎴' || reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️' && user.id === to_user;
            const collector = msg.createReactionCollector(filter)
            collector.on("collect", async (obj:MessageReaction, User: Discord.User)=>{
                
                if(obj.emoji.name == "👻")
                {
                    play1.edit("TESTE PLAY2 EDITOU ISSO");
                    //summor()
                }
                else if(obj.emoji.name == "🎴")
                {
                    play1.edit("TESTE PLAY2 EDITOU ISSO");
                    
                }
                else if(obj.emoji.name == '⬅️')
                {
                    if(index_2 > 0)
                    index_2--;
                    else
                    index_2 = (max_deck2-1)
                }
                else if(obj.emoji.name == '➡️')
                {
                    if(index_2 < max_deck2-1)
                    index_2++;
                    else
                    index_2 = 0
                }
                if(obj.count)
                    obj.users.remove(message.author.id)
                msg.edit(card_onhend( hand_player2, index_2 ));
            })
        })

    }
    setTimeout(()=>{
        if(firstchnl) message.guild?.channels.cache.get(firstchnl?.id)?.delete();

        if(secchnl)   message.guild?.channels.cache.get(secchnl?.id)?.delete();
    }, 60000); 

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