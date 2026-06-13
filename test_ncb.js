const fetch = require('node-fetch');

async function test() {
  const instance = '53990_aria_os';
  const secret = 'be75b593f70a4f50dd7eec1880349ad9c26b4d3ec2bb79aa723487875b57eaf2';
  
  // 1. Create a dummy record
  let res = await fetch(`https://app.nocodebackend.com/api/data/create/sessions?Instance=${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Database-Instance': instance, 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ name: 'TestUser', feedback: 'None' })
  });
  let data = await res.json();
  console.log("Create Response:", data);
  
  if (!data.id) return;
  const id = data.id;

  // 2. Try updating it
  res = await fetch(`https://app.nocodebackend.com/api/data/sessions/${id}?Instance=${instance}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Database-Instance': instance, 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ feedback: 'Updated Feedback' })
  });
  console.log("Update 1 Status:", res.status);
  console.log("Update 1 Response:", await res.text());
}
test();
