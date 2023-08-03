// const answer = 0 || 400;
// //truthy value --results to true
// // falsy values--includes 0,"", null,false,undefined,NAN

// //truthy value
// if (90) {
//   console.log("A thruthy value");
// } else {
//   console.log("A falsy value");
// }

// //falsy
// if (0) {
//   console.log("A thruthy value");
// } else {
//   console.log("A falsy value");
// }
// console.log(answer);

const newFunc = (arg) => {
  console.log(arg);
};

// What we do not see
var result = {
  status: 200,
};
const mainFunc = (name, cbFunc) => {
  console.log("Doing something with name");
  name = name.toUpperCase();
  console.log(result); /// - status = 200
  cbFunc(result, name);
  console.log(result); // staus -- 400
  console.log("Doing something else with results of cbfunc");
};
// Express function e.g POST,GET,query
mainFunc("Albert", (arg1, arg2) => {
  arg1.status = 400;
  arg1.user = arg2;
});
