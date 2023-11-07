export default async (req, context) => {
  const { code } = context.params;
  console.log('context.params: ', context.params);
  console.log('req-body: ', req.body);
  return new Response('test ok')
};
