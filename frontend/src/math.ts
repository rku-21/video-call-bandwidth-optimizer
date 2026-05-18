export const  createRoomId=(): string=> {
   if(crypto) return crypto?.randomUUID?.();
   return Math.random().toString(36).slice(2, 10);
}
