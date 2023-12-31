async function handleRequest(request) {
  // Check if the request is for the desired URL
  const url = new URL(request.url);
  if (url.pathname === "/connpass") {
    const storedData = await CONNPASS_PROXY_KV.get("connpassData", "json");
    return new Response(JSON.stringify(storedData), {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}

async function triggerEvent(event) {
  const apiResponse = await fetch(
    "https://connpass.com/api/v1/event/?series_id=9445&order=2&count=10",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537",
      },
    }
  );
  if (apiResponse.ok) {
    const apiData = await apiResponse.json();
    const formattedData = apiData.events.map((item) => {
      return {
        title: item.title,
        event_url: item.event_url,
        started_at: item.started_at,
        hash_tag: item.hash_tag,
      };
    });
    console.log(formattedData);
    const jsonData = JSON.stringify(formattedData);
    await CONNPASS_PROXY_KV.put("connpassData", jsonData);
  } else {
    console.log("RESPONSE NG", apiResponse.status);
  }
}

// Initialize Worker
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

addEventListener("scheduled", (event) => {
  event.waitUntil(triggerEvent(event));
});
