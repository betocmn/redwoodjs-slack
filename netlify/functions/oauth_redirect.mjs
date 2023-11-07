export default async (req, context) => {
  console.log(req.body);
  return new Response('test ok')
};
