

module.exports = {
  handler: async (event, context) => {
    console.log(event.body);
    return new Response('test ok');
  }
};
