const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const neptuneEnpoint = 'graph-mst-example.cluster-c8dnqaynan15.ap-southeast-1.neptune.amazonaws.com';

dc = new DriverRemoteConnection(`wss://${neptuneEnpoint}:8182/gremlin`,{});

const graph = new Graph();
const g = graph.traversal().withRemote(dc);


module.exports.getConnect = () => {
    return g;
}