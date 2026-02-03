import { House } from './types';

// Generar casas de Calle A: TH00A hasta TH33A, TH35A, TH37A
const calleA: House[] = [];
for (let i = 0; i <= 33; i++) {
  const num = i.toString().padStart(2, '0');
  calleA.push({ 
    id: `TH${num}A`, 
    name: `TH${num}A`, 
    owner: '', 
    balance: 0,
    street: 'Calle A'
  });
}
calleA.push({ id: 'TH35A', name: 'TH35A', owner: '', balance: 0, street: 'Calle A' });
calleA.push({ id: 'TH37A', name: 'TH37A', owner: '', balance: 0, street: 'Calle A' });

// Generar casas de Calle B: TH01B hasta TH32B
const calleB: House[] = [];
for (let i = 1; i <= 32; i++) {
  const num = i.toString().padStart(2, '0');
  calleB.push({ 
    id: `TH${num}B`, 
    name: `TH${num}B`, 
    owner: '', 
    balance: 0,
    street: 'Calle B'
  });
}

// Generar casas de Calle C: TH01C, TH03C... TH23C (impares)
const calleC: House[] = [];
for (let i = 1; i <= 23; i += 2) {
  const num = i.toString().padStart(2, '0');
  calleC.push({ 
    id: `TH${num}C`, 
    name: `TH${num}C`, 
    owner: '', 
    balance: 0,
    street: 'Calle C'
  });
}

// Generar casas de Calle P: TH01P hasta TH10P
const calleP: House[] = [];
for (let i = 1; i <= 10; i++) {
  const num = i.toString().padStart(2, '0');
  calleP.push({ 
    id: `TH${num}P`, 
    name: `TH${num}P`, 
    owner: '', 
    balance: 0,
    street: 'Calle P'
  });
}

export const INITIAL_HOUSES: House[] = [...calleA, ...calleB, ...calleC, ...calleP];

export const ADMIN_WHATSAPP = '1234567890'; // Cambia por tu WhatsApp real

export const ADMIN_KEYS = ['Admin1', 'Admin2'];
export const RESIDENT_KEY = 'VecinoTH';