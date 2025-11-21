import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Flame, Droplet, Zap, Wind, Mountain, Snowflake, Leaf, Sword, Shield, Sparkles, Users, ChevronDown, ChevronUp, Info, Star, Trophy, LayoutGrid, MessageSquare, Send, Bot, RotateCw, RefreshCw } from 'lucide-react';

// --- GEMINI API SETUP ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const callGemini = async (userPrompt, systemPrompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  // Exponential backoff retry logic
  const maxRetries = 5;
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429) {
            throw new Error('Too Many Requests');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "The Akasha is silent (No response data).";
      
    } catch (error) {
      if (i === maxRetries - 1) return "Connection to the Akasha Terminal failed. Please try again later.";
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- DATA: Character Database (Expanded) ---
const characterDatabase = [
  // --- PYRO ---
  {
    id: 'arlecchino', name: 'Arlecchino', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'SS',
    weaponType: 'Polearm',
    bestWeapons: ['Crimson Moon\'s Semblance', 'Primordial Jade Winged-Spear', 'White Tassel (F2P)'],
    artifacts: ['Fragment of Harmonic Whimsy (4pc)', 'Gladiator\'s Finale (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Vape (Yelan/Bennett)', 'Overload (Chevreuse/Fischl)']
  },
  {
    id: 'lyney', name: 'Lyney', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'S',
    weaponType: 'Bow',
    bestWeapons: ['The First Great Magic', 'Aqua Simulacra', 'Prototype Crescent (F2P)'],
    artifacts: ['Marechaussee Hunter (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['Mono Pyro (Xiangling/Bennett/Kazuha)']
  },
  {
    id: 'hutao', name: 'Hu Tao', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'S',
    weaponType: 'Polearm',
    bestWeapons: ['Staff of Homa', 'Dragon\'s Bane', 'White Tassel (F2P)'],
    artifacts: ['Crimson Witch (4pc)', 'Marechaussee Hunter (4pc w/ Furina)'],
    mainStats: { sands: 'HP% / EM', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'HP%'],
    teams: ['Double Hydro (Yelan/Xingqiu/Zhongli)', 'Plunge (Xianyun/Furina)']
  },
  {
    id: 'yoimiya', name: 'Yoimiya', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'A',
    weaponType: 'Bow',
    bestWeapons: ['Thundering Pulse', 'Rust', 'Slingshot (F2P)'],
    artifacts: ['Shimenawa\'s Reminiscence (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Vape (Yelan/Zhongli/Yun Jin)', 'Overload (Chevreuse)']
  },
  {
    id: 'xiangling', name: 'Xiangling', rarity: 4, element: 'Pyro', role: 'Sub-DPS', tier: 'SS',
    weaponType: 'Polearm',
    bestWeapons: ['The Catch (F2P)', 'Engulfing Lightning', 'Dragon\'s Bane'],
    artifacts: ['Emblem of Severed Fate (4pc)'],
    mainStats: { sands: 'ER / EM', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['ER', 'CRIT', 'EM'],
    teams: ['National', 'International', 'Mono Pyro']
  },
  {
    id: 'bennett', name: 'Bennett', rarity: 4, element: 'Pyro', role: 'Buffer/Healer', tier: 'SS',
    weaponType: 'Sword',
    bestWeapons: ['Aquila Favonia', 'Sapwood Blade (F2P)', 'Mistplitter'],
    artifacts: ['Noblesse Oblige (4pc)'],
    mainStats: { sands: 'ER / HP%', goblet: 'HP%', circlet: 'Healing/HP%' },
    subStats: ['ER', 'HP%'],
    teams: ['Universal Support']
  },
  {
    id: 'gaming', name: 'Gaming', rarity: 4, element: 'Pyro', role: 'Main DPS', tier: 'A',
    weaponType: 'Claymore',
    bestWeapons: ['Serpent Spine', 'Rainslasher', 'Mailed Flower (F2P)'],
    artifacts: ['Marechaussee Hunter (4pc)', 'Crimson Witch (4pc)'],
    mainStats: { sands: 'EM / ATK%', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'ATK%'],
    teams: ['Plunge Vape (Xianyun/Furina)']
  },
  {
    id: 'klee', name: 'Klee', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'B',
    weaponType: 'Catalyst',
    bestWeapons: ['Lost Prayer', 'Widsith', 'Dodoco Tales'],
    artifacts: ['Crimson Witch (4pc)', '2pc ATK / 2pc Pyro'],
    mainStats: { sands: 'ATK%', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Mono Pyro', 'Vape']
  },
  {
    id: 'diluc', name: 'Diluc', rarity: 5, element: 'Pyro', role: 'Main DPS', tier: 'B',
    weaponType: 'Claymore',
    bestWeapons: ['Wolf\'s Gravestone', 'Serpent Spine', 'Mailed Flower'],
    artifacts: ['Crimson Witch (4pc)'],
    mainStats: { sands: 'ATK% / EM', goblet: 'Pyro DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'ATK%'],
    teams: ['Plunge (Xianyun)', 'Vape']
  },
   {
    id: 'chevreuse', name: 'Chevreuse', rarity: 4, element: 'Pyro', role: 'Support', tier: 'S',
    weaponType: 'Polearm',
    bestWeapons: ['Rightful Reward (F2P)', 'Favonius Lance', 'Black Tassel'],
    artifacts: ['Noblesse Oblige (4pc)', 'Song of Days Past (4pc)'],
    mainStats: { sands: 'HP% / ER', goblet: 'HP%', circlet: 'HP% / Healing' },
    subStats: ['HP%', 'ER', 'CRIT (Fav)'],
    teams: ['Overload Specialist (Raiden/Yae/Arlecchino)']
  },

  // --- HYDRO ---
  {
    id: 'neuvillette', name: 'Neuvillette', rarity: 5, element: 'Hydro', role: 'Main DPS', tier: 'SS',
    weaponType: 'Catalyst',
    bestWeapons: ['Tome of the Eternal Flow', 'Prototype Amber (F2P)'],
    artifacts: ['Marechaussee Hunter (4pc)'],
    mainStats: { sands: 'HP%', goblet: 'Hydro/HP%', circlet: 'CRIT/HP%' },
    subStats: ['HP%', 'CRIT', 'ER'],
    teams: ['Hypercarry (Furina/Kazuha/Baizhu)']
  },
  {
    id: 'furina', name: 'Furina', rarity: 5, element: 'Hydro', role: 'Sub-DPS/Buffer', tier: 'SS',
    weaponType: 'Sword',
    bestWeapons: ['Splendor', 'Festering Desire', 'Fleuve Cendre (F2P)'],
    artifacts: ['Golden Troupe (4pc)'],
    mainStats: { sands: 'HP%/ER', goblet: 'HP%/Hydro', circlet: 'CRIT/HP%' },
    subStats: ['CRIT', 'ER', 'HP%'],
    teams: ['Universal Buffer']
  },
  {
    id: 'yelan', name: 'Yelan', rarity: 5, element: 'Hydro', role: 'Sub-DPS', tier: 'SS',
    weaponType: 'Bow',
    bestWeapons: ['Aqua Simulacra', 'Favonius Warbow (F2P)'],
    artifacts: ['Emblem of Severed Fate (4pc)'],
    mainStats: { sands: 'HP%/ER', goblet: 'Hydro', circlet: 'CRIT/HP%' },
    subStats: ['CRIT', 'HP%', 'ER'],
    teams: ['Double Hydro', 'Vape Support']
  },
  {
    id: 'xingqiu', name: 'Xingqiu', rarity: 4, element: 'Hydro', role: 'Sub-DPS', tier: 'SS',
    weaponType: 'Sword',
    bestWeapons: ['Sacrificial Sword', 'Favonius Sword'],
    artifacts: ['Emblem of Severed Fate (4pc)'],
    mainStats: { sands: 'ATK%/ER', goblet: 'Hydro', circlet: 'CRIT' },
    subStats: ['ER', 'CRIT', 'ATK%'],
    teams: ['National', 'Taser', 'Hyperbloom']
  },
  {
    id: 'kokomi', name: 'Kokomi', rarity: 5, element: 'Hydro', role: 'Healer/Driver', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Thrilling Tales (F2P)', 'Prototype Amber (F2P)'],
    artifacts: ['Ocean-Hued Clam', 'Tenacity'],
    mainStats: { sands: 'HP%', goblet: 'HP%/Hydro', circlet: 'Healing' },
    subStats: ['HP%', 'ER'],
    teams: ['Freeze', 'Nilou Bloom']
  },
  {
    id: 'nilou', name: 'Nilou', rarity: 5, element: 'Hydro', role: 'Bloom Support', tier: 'S',
    weaponType: 'Sword',
    bestWeapons: ['Key of Khaj-Nisut', 'Iron Sting (F2P)', 'Dockhand'],
    artifacts: ['2pc HP% / 2pc HP%'],
    mainStats: { sands: 'HP%', goblet: 'HP%', circlet: 'HP%' },
    subStats: ['HP%', 'EM', 'ER'],
    teams: ['Superbloom (Nahida/Kokomi/Dendro)']
  },
  {
    id: 'ayato', name: 'Ayato', rarity: 5, element: 'Hydro', role: 'Main DPS', tier: 'A',
    weaponType: 'Sword',
    bestWeapons: ['Haran Geppaku Futsu', 'Jade Cutter', 'Amenoma (F2P)'],
    artifacts: ['Echoes of an Offering', 'Heart of Depth'],
    mainStats: { sands: 'ATK%', goblet: 'Hydro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['Soup (Bennett/Kazuha/Fischl)', 'Hyperbloom']
  },
  {
    id: 'childe', name: 'Tartaglia', rarity: 5, element: 'Hydro', role: 'Main DPS', tier: 'S',
    weaponType: 'Bow',
    bestWeapons: ['Polar Star', 'Thundering Pulse', 'The Stringless'],
    artifacts: ['Nymph\'s Dream (4pc)', 'Heart of Depth (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Hydro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['International (Xiangling/Bennett/Kazuha)']
  },
   {
    id: 'mualani', name: 'Mualani', rarity: 5, element: 'Hydro', role: 'Main DPS', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Surf\'s Up', 'Ring of Yaxche (F2P)'],
    artifacts: ['Obsidian Codex (4pc)'],
    mainStats: { sands: 'HP%', goblet: 'Hydro', circlet: 'CRIT/HP%' },
    subStats: ['HP%', 'CRIT', 'EM'],
    teams: ['Vape (Xiangling/Kazuha)']
  },

  // --- DENDRO ---
  {
    id: 'nahida', name: 'Nahida', rarity: 5, element: 'Dendro', role: 'Sub-DPS/Support', tier: 'SS',
    weaponType: 'Catalyst',
    bestWeapons: ['Thousand Floating Dreams', 'Magic Guide (F2P)'],
    artifacts: ['Deepwood Memories (4pc)'],
    mainStats: { sands: 'EM', goblet: 'EM/Dendro', circlet: 'EM/CRIT' },
    subStats: ['EM', 'CRIT', 'ER'],
    teams: ['Hyperbloom', 'Aggravate', 'Bloom']
  },
  {
    id: 'alhaitham', name: 'Alhaitham', rarity: 5, element: 'Dendro', role: 'Main DPS', tier: 'SS',
    weaponType: 'Sword',
    bestWeapons: ['Light of Foliar Incision', 'Iron Sting (F2P)'],
    artifacts: ['Gilded Dreams (4pc)'],
    mainStats: { sands: 'EM', goblet: 'Dendro', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'ER'],
    teams: ['Quickbloom (Furina/Kuki)', 'Spread']
  },
  {
    id: 'baizhu', name: 'Baizhu', rarity: 5, element: 'Dendro', role: 'Healer/Shielder', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Jadefall\'s Splendor', 'Prototype Amber (F2P)'],
    artifacts: ['Deepwood Memories (4pc)', 'Ocean-Hued Clam'],
    mainStats: { sands: 'HP%/ER', goblet: 'HP%', circlet: 'HP%' },
    subStats: ['HP%', 'ER'],
    teams: ['Cyno Aggravate', 'Neuvillette Teams']
  },
  {
    id: 'kinich', name: 'Kinich', rarity: 5, element: 'Dendro', role: 'Main DPS', tier: 'S',
    weaponType: 'Claymore',
    bestWeapons: ['Fang of the Mountain King', 'Earth Shaker (F2P)'],
    artifacts: ['Obsidian Codex (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Dendro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Burning (Emilie)', 'Burgeon']
  },
  {
    id: 'emilie', name: 'Emilie', rarity: 5, element: 'Dendro', role: 'Sub-DPS', tier: 'S',
    weaponType: 'Polearm',
    bestWeapons: ['Lumidouce Elegy', 'Missive Windspear'],
    artifacts: ['Unfinished Reverie (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Dendro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['Burning (Kinich/Lyney)', 'Burnmelt']
  },
  {
    id: 'tighnari', name: 'Tighnari', rarity: 5, element: 'Dendro', role: 'Quickswap DPS', tier: 'A',
    weaponType: 'Bow',
    bestWeapons: ['Hunter\'s Path', 'Slingshot (F2P)'],
    artifacts: ['Wanderer\'s Troupe (4pc)', 'Gilded Dreams'],
    mainStats: { sands: 'EM/ATK%', goblet: 'Dendro', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'ATK%'],
    teams: ['Spread (Yae Miko/Fischl/Zhongli)']
  },
  {
    id: 'yaoyao', name: 'Yaoyao', rarity: 4, element: 'Dendro', role: 'Healer', tier: 'A',
    weaponType: 'Polearm',
    bestWeapons: ['Favonius Lance', 'Black Tassel'],
    artifacts: ['Deepwood Memories (4pc)'],
    mainStats: { sands: 'HP%/ER', goblet: 'HP%', circlet: 'Healing/CRIT' },
    subStats: ['HP%', 'ER'],
    teams: ['Aggravate', 'Nilou Bloom']
  },

  // --- ELECTRO ---
  {
    id: 'raiden', name: 'Raiden Shogun', rarity: 5, element: 'Electro', role: 'DPS/Battery', tier: 'SS',
    weaponType: 'Polearm',
    bestWeapons: ['Engulfing Lightning', 'The Catch (F2P)'],
    artifacts: ['Emblem of Severed Fate (4pc)'],
    mainStats: { sands: 'ER', goblet: 'Electro/ATK%', circlet: 'CRIT' },
    subStats: ['CRIT', 'ER', 'ATK%'],
    teams: ['Rational', 'Hypercarry', 'Hyperbloom (EM Build)']
  },
  {
    id: 'clorinde', name: 'Clorinde', rarity: 5, element: 'Electro', role: 'Main DPS', tier: 'S',
    weaponType: 'Sword',
    bestWeapons: ['Absolution', 'Finale of the Deep (F2P)'],
    artifacts: ['Fragment of Harmonic Whimsy (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Aggravate (Fischl/Nahida)', 'Overload']
  },
  {
    id: 'yae', name: 'Yae Miko', rarity: 5, element: 'Electro', role: 'Sub-DPS', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Kagura\'s Verity', 'Widsith'],
    artifacts: ['Golden Troupe (4pc)', 'Gilded Dreams (4pc)'],
    mainStats: { sands: 'ATK%/EM', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Aggravate (Tighnari)', 'Spread']
  },
  {
    id: 'kuki', name: 'Kuki Shinobu', rarity: 4, element: 'Electro', role: 'Healer/Trigger', tier: 'S',
    weaponType: 'Sword',
    bestWeapons: ['Freedom-Sworn', 'Iron Sting (F2P)'],
    artifacts: ['Gilded Dreams (4pc)', 'Flower of Paradise Lost'],
    mainStats: { sands: 'EM', goblet: 'EM', circlet: 'EM' },
    subStats: ['EM', 'HP%'],
    teams: ['Hyperbloom (Essential)']
  },
  {
    id: 'fischl', name: 'Fischl', rarity: 4, element: 'Electro', role: 'Sub-DPS', tier: 'SS',
    weaponType: 'Bow',
    bestWeapons: ['Polar Star', 'Stringless'],
    artifacts: ['Golden Troupe (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Aggravate', 'Taser']
  },
  {
    id: 'cyno', name: 'Cyno', rarity: 5, element: 'Electro', role: 'Main DPS', tier: 'A',
    weaponType: 'Polearm',
    bestWeapons: ['Staff of the Scarlet Sands', 'White Tassel (F2P)'],
    artifacts: ['Gilded Dreams (4pc)', 'Thundering Fury (4pc)'],
    mainStats: { sands: 'EM', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['CRIT', 'EM', 'ER'],
    teams: ['Quickbloom (Furina/Baizhu/Nahida)']
  },
  {
    id: 'keqing', name: 'Keqing', rarity: 5, element: 'Electro', role: 'Main DPS', tier: 'A',
    weaponType: 'Sword',
    bestWeapons: ['Mistsplitter', 'Lion\'s Roar'],
    artifacts: ['Thundering Fury (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Aggravate (Fischl/Nahida/Kazuha)']
  },
  {
    id: 'sethos', name: 'Sethos', rarity: 4, element: 'Electro', role: 'Main DPS', tier: 'B',
    weaponType: 'Bow',
    bestWeapons: ['Hunter\'s Path', 'Slingshot (F2P)'],
    artifacts: ['Wanderer\'s Troupe (4pc)'],
    mainStats: { sands: 'EM', goblet: 'Electro', circlet: 'CRIT' },
    subStats: ['EM', 'CRIT', 'ER'],
    teams: ['Aggravate']
  },

  // --- ANEMO ---
  {
    id: 'kazuha', name: 'Kazuha', rarity: 5, element: 'Anemo', role: 'Buffer', tier: 'SS',
    weaponType: 'Sword',
    bestWeapons: ['Freedom-Sworn', 'Iron Sting (F2P)', 'Favonius'],
    artifacts: ['Viridescent Venerer (4pc)'],
    mainStats: { sands: 'EM', goblet: 'EM', circlet: 'EM' },
    subStats: ['EM', 'ER'],
    teams: ['Universal Support']
  },
  {
    id: 'xianyun', name: 'Xianyun', rarity: 5, element: 'Anemo', role: 'Healer/Plunge', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Crane\'s Echoing Call', 'Oathsworn Eye'],
    artifacts: ['Song of Days Past (4pc)', 'Viridescent Venerer (4pc)'],
    mainStats: { sands: 'ATK%/ER', goblet: 'ATK%', circlet: 'ATK%/Healing' },
    subStats: ['ATK%', 'ER'],
    teams: ['Plunge (Xiao/Diluc/Gaming)']
  },
  {
    id: 'xiao', name: 'Xiao', rarity: 5, element: 'Anemo', role: 'Main DPS', tier: 'A',
    weaponType: 'Polearm',
    bestWeapons: ['PJWS', 'Homa', 'Missive Windspear'],
    artifacts: ['Vermillion Hereafter (4pc)', 'Marechaussee Hunter'],
    mainStats: { sands: 'ATK%', goblet: 'Anemo', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['FFXX (Furina/Faruzan/Xianyun)']
  },
  {
    id: 'wanderer', name: 'Wanderer', rarity: 5, element: 'Anemo', role: 'Main DPS', tier: 'A',
    weaponType: 'Catalyst',
    bestWeapons: ['Tulaytullah\'s Remembrance', 'Widsith'],
    artifacts: ['Desert Pavilion Chronicle (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Anemo', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'Speed'],
    teams: ['Hyper (Faruzan/Bennett/Zhongli)']
  },
  {
    id: 'venti', name: 'Venti', rarity: 5, element: 'Anemo', role: 'Sub-DPS/CC', tier: 'A',
    weaponType: 'Bow',
    bestWeapons: ['Elegy for the End', 'Stringless'],
    artifacts: ['Viridescent Venerer (4pc)'],
    mainStats: { sands: 'EM/ATK%', goblet: 'Anemo/EM', circlet: 'CRIT/EM' },
    subStats: ['ER', 'EM', 'CRIT'],
    teams: ['Morgana (Ganyu)', 'Small Mob Content']
  },
  {
    id: 'faruzan', name: 'Faruzan', rarity: 4, element: 'Anemo', role: 'Anemo Buffer', tier: 'S',
    weaponType: 'Bow',
    bestWeapons: ['Elegy', 'Favonius Warbow'],
    artifacts: ['Tenacity (4pc)', 'Noblesse'],
    mainStats: { sands: 'ER', goblet: 'Anemo/ATK', circlet: 'CRIT' },
    subStats: ['ER', 'CRIT (Fav)'],
    teams: ['Xiao/Wanderer Support']
  },
  {
    id: 'jean', name: 'Jean', rarity: 5, element: 'Anemo', role: 'Healer', tier: 'A',
    weaponType: 'Sword',
    bestWeapons: ['Favonius Sword', 'Amenoma'],
    artifacts: ['Viridescent Venerer (4pc)'],
    mainStats: { sands: 'ATK%/ER', goblet: 'Anemo/ATK%', circlet: 'CRIT/Healing' },
    subStats: ['ER', 'ATK%', 'CRIT'],
    teams: ['Furina Teams', 'Sunfire']
  },
  {
    id: 'sucrose', name: 'Sucrose', rarity: 4, element: 'Anemo', role: 'Buffer/Driver', tier: 'A',
    weaponType: 'Catalyst',
    bestWeapons: ['Sacrificial Fragments'],
    artifacts: ['Viridescent Venerer (4pc)'],
    mainStats: { sands: 'EM', goblet: 'EM', circlet: 'EM' },
    subStats: ['EM', 'ER'],
    teams: ['National', 'Taser']
  },

  // --- CRYO ---
  {
    id: 'wriothesley', name: 'Wriothesley', rarity: 5, element: 'Cryo', role: 'Main DPS', tier: 'S',
    weaponType: 'Catalyst',
    bestWeapons: ['Cashflow Supervision', 'Flowing Purity (F2P)'],
    artifacts: ['Marechaussee Hunter (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Cryo', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Melt (Xiangling)', 'Burnmelt (Emilie)']
  },
  {
    id: 'ayaka', name: 'Ayaka', rarity: 5, element: 'Cryo', role: 'Main DPS', tier: 'S',
    weaponType: 'Sword',
    bestWeapons: ['Mistsplitter', 'Amenoma (F2P)'],
    artifacts: ['Blizzard Strayer (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Cryo', circlet: 'CRIT DMG' },
    subStats: ['CRIT DMG', 'ATK%', 'ER'],
    teams: ['Freeze (Shenhe/Kazuha/Kokomi)']
  },
  {
    id: 'ganyu', name: 'Ganyu', rarity: 5, element: 'Cryo', role: 'Main DPS', tier: 'A',
    weaponType: 'Bow',
    bestWeapons: ['Amos Bow', 'Hamayumi (F2P)'],
    artifacts: ['Wanderer\'s Troupe (Melt)', 'Blizzard Strayer (Freeze)'],
    mainStats: { sands: 'ATK%/EM', goblet: 'Cryo', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'EM'],
    teams: ['Melt', 'Freeze']
  },
  {
    id: 'shenhe', name: 'Shenhe', rarity: 5, element: 'Cryo', role: 'Cryo Buffer', tier: 'S',
    weaponType: 'Polearm',
    bestWeapons: ['Calamity Queller', 'Favonius Lance'],
    artifacts: ['Noblesse Oblige', '2pc ATK / 2pc ATK'],
    mainStats: { sands: 'ATK%', goblet: 'ATK%', circlet: 'ATK%' },
    subStats: ['ER', 'ATK%', 'CRIT (Fav)'],
    teams: ['Ayaka/Wrio Support']
  },
  {
    id: 'charlotte', name: 'Charlotte', rarity: 4, element: 'Cryo', role: 'Healer', tier: 'A',
    weaponType: 'Catalyst',
    bestWeapons: ['Favonius Codex'],
    artifacts: ['Noblesse Oblige', 'Tenacity'],
    mainStats: { sands: 'ER', goblet: 'ATK%', circlet: 'Healing/CRIT' },
    subStats: ['ER', 'ATK%'],
    teams: ['Furina Freeze Teams']
  },
  {
    id: 'eula', name: 'Eula', rarity: 5, element: 'Cryo', role: 'Physical DPS', tier: 'B',
    weaponType: 'Claymore',
    bestWeapons: ['Song of Broken Pines', 'Snow-Tombed Starsilver'],
    artifacts: ['Pale Flame (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Phys DMG', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['Superconduct (Raiden/Rosaria/Bennett)']
  },
  
  // --- GEO ---
  {
    id: 'navia', name: 'Navia', rarity: 5, element: 'Geo', role: 'Main DPS', tier: 'S',
    weaponType: 'Claymore',
    bestWeapons: ['Verdict', 'Serpent Spine', 'Mega Magic Sword (F2P)'],
    artifacts: ['Nighttime Whispers (4pc)'],
    mainStats: { sands: 'ATK%', goblet: 'Geo', circlet: 'CRIT' },
    subStats: ['CRIT', 'ATK%', 'ER'],
    teams: ['Double Geo (Zhongli/Bennett/Xiangling)']
  },
  {
    id: 'zhongli', name: 'Zhongli', rarity: 5, element: 'Geo', role: 'Shielder', tier: 'SS',
    weaponType: 'Polearm',
    bestWeapons: ['Black Tassel (F2P)', 'Favonius Lance'],
    artifacts: ['Tenacity of the Millelith (4pc)'],
    mainStats: { sands: 'HP%', goblet: 'HP%', circlet: 'HP%' },
    subStats: ['HP%', 'CRIT (Fav)'],
    teams: ['Universal Shielder']
  },
  {
    id: 'chiori', name: 'Chiori', rarity: 5, element: 'Geo', role: 'Sub-DPS', tier: 'S',
    weaponType: 'Sword',
    bestWeapons: ['Uraku Misugiri', 'Harbinger of Dawn (F2P)'],
    artifacts: ['Golden Troupe (4pc)', 'Husk of Opulent Dreams'],
    mainStats: { sands: 'DEF%', goblet: 'Geo', circlet: 'CRIT' },
    subStats: ['CRIT', 'DEF%', 'ATK%'],
    teams: ['Geo Teams (Itto/Navia)']
  },
  {
    id: 'itto', name: 'Itto', rarity: 5, element: 'Geo', role: 'Main DPS', tier: 'A',
    weaponType: 'Claymore',
    bestWeapons: ['Redhorn Stonethresher', 'Whiteblind (F2P)'],
    artifacts: ['Husk of Opulent Dreams (4pc)'],
    mainStats: { sands: 'DEF%', goblet: 'Geo', circlet: 'CRIT' },
    subStats: ['CRIT', 'DEF%', 'ER'],
    teams: ['Mono Geo (Gorou/Albedo/Zhongli)']
  },
  {
    id: 'albedo', name: 'Albedo', rarity: 5, element: 'Geo', role: 'Sub-DPS', tier: 'A',
    weaponType: 'Sword',
    bestWeapons: ['Cinnabar Spindle', 'Harbinger of Dawn'],
    artifacts: ['Husk of Opulent Dreams (4pc)', 'Golden Troupe'],
    mainStats: { sands: 'DEF%', goblet: 'Geo', circlet: 'CRIT' },
    subStats: ['DEF%', 'CRIT'],
    teams: ['Mono Geo', 'Hu Tao Double Geo']
  }
];

// --- UTILITIES ---
const getElementIcon = (element, className = "w-5 h-5") => {
  const props = { className, fill: "currentColor" };
  switch(element) {
    case 'Pyro': return <Flame {...props} className={`${className} text-red-500`} />;
    case 'Hydro': return <Droplet {...props} className={`${className} text-blue-500`} />;
    case 'Dendro': return <Leaf {...props} className={`${className} text-green-500`} />;
    case 'Electro': return <Zap {...props} className={`${className} text-purple-500`} />;
    case 'Anemo': return <Wind {...props} className={`${className} text-teal-400`} />;
    case 'Geo': return <Mountain {...props} className={`${className} text-yellow-600`} />;
    case 'Cryo': return <Snowflake {...props} className={`${className} text-cyan-300`} />;
    default: return <Sparkles {...props} className={`${className} text-gray-400`} />;
  }
};

const getElementColor = (element) => {
  switch(element) {
    case 'Pyro': return 'bg-red-900/30 border-red-700 text-red-100';
    case 'Hydro': return 'bg-blue-900/30 border-blue-700 text-blue-100';
    case 'Dendro': return 'bg-green-900/30 border-green-700 text-green-100';
    case 'Electro': return 'bg-purple-900/30 border-purple-700 text-purple-100';
    case 'Anemo': return 'bg-teal-900/30 border-teal-700 text-teal-100';
    case 'Geo': return 'bg-yellow-900/30 border-yellow-700 text-yellow-100';
    case 'Cryo': return 'bg-cyan-900/30 border-cyan-700 text-cyan-100';
    default: return 'bg-gray-800 border-gray-600 text-gray-100';
  }
};

const getTierColor = (tier) => {
  if (tier === 'SS') return 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400 text-white shadow-orange-500/20 shadow-lg';
  if (tier === 'S') return 'bg-purple-600/50 border-purple-400 text-purple-100';
  return 'bg-gray-700/50 border-gray-600 text-gray-300';
};

// --- AKASHA TERMINAL (AI CHAT) ---
const AkashaTerminal = ({ char }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `I am the Akasha Terminal. Ask me anything about ${char.name}'s builds, rotations, or synergies.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (textOverride = null) => {
    const userText = textOverride || input.trim();
    if (!userText || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    const systemPrompt = `You are the Akasha Terminal, an expert AI guide for Genshin Impact. The user is currently viewing the character: ${char.name} (Element: ${char.element}, Role: ${char.role}). 
    Provided Data:
    - Weapons: ${char.bestWeapons.join(', ')}
    - Artifacts: ${char.artifacts.join(', ')}
    - Teams: ${char.teams.join(', ')}
    
    Answer the user's question concisely and accurately. Focus on gameplay mechanics, stats, team rotations, and synergy. 
    If asked about "Rotation", provide a step-by-step skill/burst usage order for a common team.
    Keep the tone helpful, knowledgeable, and slightly mystical but practical. Use emojis occasionally.`;

    try {
      const responseText = await callGemini(userText, systemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Connection interrupted. The Ley Lines are unstable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-950/50 rounded-xl border border-green-500/30 overflow-hidden relative">
      {/* Decoration */}
      <div className="absolute top-0 right-0 p-2 opacity-20">
         <Sparkles className="text-green-400 w-24 h-24" />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-green-500/20 bg-green-900/10 flex gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => handleSend(`What is the best rotation for ${char.name}?`)}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-200 hover:bg-green-500/20 whitespace-nowrap transition-all"
        >
          <RotateCw className="w-3 h-3" /> Generate Rotation ✨
        </button>
        <button 
          onClick={() => handleSend(`How much Energy Recharge (ER) does ${char.name} need?`)}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-200 hover:bg-green-500/20 whitespace-nowrap transition-all"
        >
          <Zap className="w-3 h-3" /> ER Requirements ✨
        </button>
        <button 
          onClick={() => handleSend(`Why is ${char.artifacts[0]} good for ${char.name}?`)}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-200 hover:bg-green-500/20 whitespace-nowrap transition-all"
        >
          <Shield className="w-3 h-3" /> Explain Artifacts ✨
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-900/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-gray-800/80 text-green-100 border border-green-500/20 rounded-bl-none'
            }`}>
               {msg.role === 'assistant' && <Bot className="w-4 h-4 mb-1 text-green-400" />}
               {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 p-3 rounded-xl rounded-bl-none border border-green-500/20 flex items-center gap-2 text-green-200 text-sm">
              <RefreshCw className="w-3 h-3 animate-spin" /> Accessing Ley Lines...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-green-500/20 bg-gray-900/80 backdrop-blur-sm">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask the Akasha about ${char.name}...`}
            className="w-full bg-black/30 border border-green-500/30 rounded-full py-3 pl-4 pr-12 text-sm text-green-100 placeholder-green-500/50 focus:outline-none focus:border-green-400 transition-colors"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTS ---

const CharacterCard = ({ char, onClick, viewMode }) => {
  const isMetaView = viewMode === 'meta';
  
  return (
    <div 
      onClick={() => onClick(char)}
      className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${getElementColor(char.element)} border-opacity-40 bg-opacity-40`}
    >
      {isMetaView && (char.tier === 'SS' || char.tier === 'S') && (
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/80 z-0"></div>
      
      <div className="relative z-10 p-4 flex flex-col h-full min-h-[160px]">
        <div className="flex justify-between items-start mb-2">
          <div className="p-1.5 bg-black/40 rounded-lg backdrop-blur-sm">
            {getElementIcon(char.element)}
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${char.rarity === 5 ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40' : 'bg-purple-500/20 text-purple-200 border border-purple-500/40'}`}>
              {char.rarity}★
            </span>
            {isMetaView && (
               <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${getTierColor(char.tier)}`}>
                 {char.tier}
               </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <h3 className="text-lg font-bold text-white leading-tight">{char.name}</h3>
          <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
             {char.role}
          </p>
          {isMetaView && (
            <div className="mt-2 pt-2 border-t border-white/10">
               <p className="text-[10px] text-yellow-200 opacity-80">Top Team: {char.teams[0]?.split('(')[0]}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

const BuildModal = ({ char, onClose }) => {
  const [activeTab, setActiveTab] = useState('build'); // 'build' or 'ai'

  if (!char) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/95 backdrop-blur-md flex-shrink-0`}>
          <div className="flex items-center gap-4">
             <div className={`p-2 rounded-xl ${getElementColor(char.element)} bg-opacity-100`}>
               {getElementIcon(char.element)}
             </div>
             <div>
               <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{char.name}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded text-white ${getTierColor(char.tier)}`}>
                    Tier {char.tier}
                  </span>
               </div>
               <div className="flex gap-2 text-sm text-gray-400">
                  <span>{char.weaponType}</span>
                  <span>•</span>
                  <span>{char.role}</span>
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <span className="text-gray-400 hover:text-white text-xl">✕</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-900/95">
          <button 
            onClick={() => setActiveTab('build')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'build' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Build Data
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'border-green-500 text-green-400 bg-green-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            <Sparkles className="w-4 h-4" /> Akasha AI ✨
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {activeTab === 'build' ? (
            <div className="space-y-6 text-gray-200">
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-400 mb-3">
                  <Sword className="w-5 h-5" /> Best Weapons
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {char.bestWeapons.map((w, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase ${i===0 ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700 text-gray-400'}`}>
                        {i === 0 ? 'BiS' : (w.includes('F2P') ? 'F2P' : 'Alt')}
                      </span>
                      <span className="font-medium text-sm">{w}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-purple-400 mb-3">
                  <Shield className="w-5 h-5" /> Best Artifacts
                </h3>
                <div className="space-y-3">
                  {char.artifacts.map((a, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <span className="font-medium text-sm text-purple-200">{a}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-md font-bold text-blue-400 mb-3">
                    <Info className="w-4 h-4" /> Main Stats
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden text-sm">
                    <div className="p-3 border-b border-gray-700 flex justify-between">
                      <span className="text-gray-400">Sands</span>
                      <span className="text-white text-right">{char.mainStats.sands}</span>
                    </div>
                    <div className="p-3 border-b border-gray-700 flex justify-between">
                      <span className="text-gray-400">Goblet</span>
                      <span className="text-white text-right">{char.mainStats.goblet}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Circlet</span>
                      <span className="text-white text-right">{char.mainStats.circlet}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-md font-bold text-green-400 mb-3">
                    <Sparkles className="w-4 h-4" /> Substats Priority
                  </h3>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-sm flex flex-wrap gap-2">
                    {char.subStats.map((stat, i) => (
                      <span key={i} className="bg-gray-900 px-3 py-1 rounded-full border border-gray-600">
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-pink-400 mb-3">
                  <Users className="w-5 h-5" /> Recommended Teams
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {char.teams.map((team, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-sm">
                      {team}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <AkashaTerminal char={char} />
          )}
        </div>
      </div>
    </div>
  );
};

const GenshinGuide = () => {
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedChar, setSelectedChar] = useState(null);

  const filteredChars = useMemo(() => {
    return characterDatabase.filter(c => {
      const matchesName = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesElement = filterElement === 'All' || c.element === filterElement;
      const matchesTab = activeTab === 'all' ? true : (c.tier === 'SS' || c.tier === 'S');
      return matchesName && matchesElement && matchesTab;
    }).sort((a, b) => {
        if (activeTab === 'meta') {
            if (a.tier === b.tier) return a.name.localeCompare(b.name);
            return a.tier === 'SS' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
  }, [search, filterElement, activeTab]);

  const elements = ['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          {/* Title Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
             <div className="flex items-center gap-2">
               <Sparkles className="text-yellow-500 fill-yellow-500" />
               <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                 Teyvat Field Guide
               </h1>
             </div>

             <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                   <LayoutGrid className="w-4 h-4" /> All Characters
                </button>
                <button 
                  onClick={() => setActiveTab('meta')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'meta' ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-700/50 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                   <Trophy className="w-4 h-4" /> Meta Snapshot
                </button>
             </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
             {/* Element Filter */}
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
               {elements.map(el => (
                 <button
                   key={el}
                   onClick={() => setFilterElement(el)}
                   className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                     filterElement === el 
                     ? 'bg-white text-black border-white' 
                     : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'
                   }`}
                 >
                   {el}
                 </button>
               ))}
             </div>

             {/* Search */}
             <div className="relative group w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="w-full bg-gray-900 border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'meta' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500 rounded-r-lg">
                <h2 className="text-xl font-bold text-yellow-100 mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> Current Meta Snapshot
                </h2>
                <p className="text-gray-400 text-sm max-w-2xl">
                    Displaying <span className="text-yellow-400 font-bold">SS</span> and <span className="text-purple-400 font-bold">S</span> tier units widely considered optimal for Spiral Abyss 12. Rankings based on versatility, damage ceiling, and usage rates (Game8/Akasha data).
                </p>
            </div>
        )}

        {filteredChars.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No travelers found matching criteria.</p>
            <button onClick={() => {setSearch(''); setFilterElement('All')}} className="text-yellow-500 hover:underline mt-2">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredChars.map(char => (
              <CharacterCard 
                key={char.id} 
                char={char} 
                onClick={setSelectedChar}
                viewMode={activeTab}
              />
            ))}
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
             Teyvat Field Guide • 2024/2025 Updated • Powered by Akasha AI
        </div>
      </main>

      {selectedChar && (
        <BuildModal char={selectedChar} onClose={() => setSelectedChar(null)} />
      )}
    </div>
  );
};

export default GenshinGuide;