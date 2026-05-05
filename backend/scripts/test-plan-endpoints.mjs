const id = crypto.randomUUID();
const now = new Date().toISOString();

async function asText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function main() {
  const postUser = await fetch("http://localhost:4000/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      alias: "plan_api_test",
      country: "ES",
      startDatetime: now,
      currentDatetime: now,
      userPlan: "free",
      trackingConsent: true,
    }),
  });

  const getBefore = await fetch(`http://localhost:4000/users/${id}/plan`);
  const putPlan = await fetch(`http://localhost:4000/users/${id}/plan`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "premium" }),
  });
  const getAfter = await fetch(`http://localhost:4000/users/${id}/plan`);

  const result = {
    id,
    postUserStatus: postUser.status,
    postUserBody: await asText(postUser),
    getBeforeStatus: getBefore.status,
    getBeforeBody: await asText(getBefore),
    putStatus: putPlan.status,
    putBody: await asText(putPlan),
    getAfterStatus: getAfter.status,
    getAfterBody: await asText(getAfter),
  };

  console.log(JSON.stringify(result));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
