import axios from "axios";

export function getRootApi(method, data) {
    return axios({
      url: "/data/rootdata.json",
      method: method,
      data: data,
    });
}


export function getChildrenApi(method, data) {
return axios({
    url: "/data/childrendata.json",
    method: method,
    data: data,
});
}