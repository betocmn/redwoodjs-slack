export default async (req, context) => {
  const { city, country } = context.params;
  return new Response('test ok')
};
