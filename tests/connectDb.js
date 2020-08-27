const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const neptuneEnpoint = 'graph-mst-example.cluster-c8dnqaynan15.ap-southeast-1.neptune.amazonaws.com';
const tinkerPopServerEnpoint = 'localhost';

const dcNeptune = new DriverRemoteConnection(`wss://${neptuneEnpoint}:8182/gremlin`,{});
const dcTinkerPop = new DriverRemoteConnection(`ws://${tinkerPopServerEnpoint}:8182/gremlin`,{});

const graph = new Graph();
const gNeptune = graph.traversal().withRemote(dcNeptune);
const gTinkerPop = graph.traversal().withRemote(dcTinkerPop);


module.exports.getConnect = () => {
    return { gNeptune, gTinkerPop };
}