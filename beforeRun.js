if (!process.env.EMAIL || !process.env.PASSWORD) {
  console.error('Missing env variables');
  process.exit(128);
}
process.exit(0);