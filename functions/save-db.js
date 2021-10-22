const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: "fnAEWI1BxhAAQzaa8AVTtcMvw4TVoR3HNP3RlKHZ",
});

exports.handler = async function (event, context) {
  const data = JSON.parse(event.body);
  console.log("Function `todo-create` invoked", data);
  const todoItem = {
    data: data,
  };
  await client.query(q.Create(q.Ref("classes"), { name: "todos" }))
    .then(()=>{
      return client.query(
        q.Create(q.Ref("indexes"), {
          name: "all_todos",
          source: q.Ref("classes/todos")
        }))
    }).catch((e) => {
      // Database already exists
      if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
        console.log('DB already exists')
        throw e
      }
    })
  /* construct the fauna query */
  return client
    .query(q.Create(q.Ref("classes/todos"), todoItem))
    .then((response) => {
      console.log("success", response);
      /* Success! return the response with statusCode 200 */
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    })
    .catch((error) => {
      console.log("error", error);
      /* Error! return the error with statusCode 400 */
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};
