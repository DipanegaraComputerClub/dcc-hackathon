import { Hono } from 'hono'

const server = Bun.serve({
  port: 3001, // Ganti dengan nomor port yang Anda inginkan
  fetch(req) {
    return new Response("Halo dari Bunnn!");
  },
});

console.log(`Mendengarkan di http://localhost:${server.port}`);
