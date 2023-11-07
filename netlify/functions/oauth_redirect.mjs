

module.exports = {
  handler: async (event, context) => {
    console.log(event.body);
    return Response('',{
      status: 200,
    });
  }
};
