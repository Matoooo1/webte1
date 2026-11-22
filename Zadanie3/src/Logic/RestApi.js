const REST_API_URL = "https://wt1zadanie.iolab.sk"

async function getJson(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);

        throw new Error(
            `Server odpovedal chybou ${response.status} a povedal: ${errorData.detail}`
        );
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}
export async function Health(){
    const url = `${REST_API_URL}/health`;
    const data = await getJson(url);
    if (!data) {
        throw new Error(`nemam nic bohuzial.`);
    }
    return data;
}
export async function GET(name){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}`;
    const data = await getJson(url);
    if (!data) {
        throw new Error(`GET zlyhal.`);
    }
    return data;
}
export async function POST(name, todo){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}`;
    const data = await getJson(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(todo)
    });
    if (!data) {
        throw new Error(`POST zlyhal.`);
    }
    return data;
}
export async function RESET(name){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/reset`;
    const data = await getJson(url, {
        method: "POST",
    });
    if (!data) {
        throw new Error(`RESET zlyhal.`);
    }
    return data;
}
export async function GET_ONE(name, id){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/${id}`;
    const data = await getJson(url)
    if (!data) {
        throw new Error(`GET_ONE zlyhal.`);
    }
    return data;
}
export async function PUT(name, id, todo){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/${id}`;
    const data = await getJson(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(todo)
    });
    if (!data) {
        throw new Error(`PUT zlyhal.`);
    }
    return data;
}
export async function DELETE(name, id){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/${id}`;
    const data = await getJson(url, {
        method: "DELETE",
    });
}
export async function PATCH1(name, id){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/${id}/done`;
    const data = await getJson(url, {
        method: "PATCH",
    })
}
export async function PATCH2(name, id){
    const url = `${REST_API_URL}/api/${encodeURIComponent(name)}/${id}/undone`;
    const data = await getJson(url, {
        method: "PATCH",
    })
}