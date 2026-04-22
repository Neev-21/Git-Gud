const username = "Neev-21";
fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitGud-App'
    }
}).then(res => {
    console.log("Status:", res.status);
    return res.json();
}).then(data => {
    if (Array.isArray(data)) {
        console.log("Total events:", data.length);
        const pushes = data.filter(e => e.type === "PushEvent");
        console.log("PushEvents:", pushes.length);
        let commitCount = 0;
        pushes.forEach(p => commitCount += (p.payload.commits || []).length);
        console.log("Total commits:", commitCount);
    } else {
        console.log(data);
    }
});
