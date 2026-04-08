const http = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const socketHandler = require("../../src/sockets/socketHandler");
const DriverLocation = require("../../src/models/DriverLocation");
const Order = require("../../src/models/deliveryModel");
const User = require("../../src/models/User");

jest.mock("../../src/models/DriverLocation");
jest.mock("../../src/models/deliveryModel");
jest.mock("../../src/models/User");

describe("Socket Handler Unit Tests", () => {
  let io, server, clientSocket, adminSocket;
  let port;

  beforeAll((done) => {
    server = http.createServer();
    io = new Server(server);
    socketHandler(io);
    server.listen(() => {
      port = server.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    server.close();
    clientSocket.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("driver_go_online: should update driver status to online", (done) => {
    const data = { driver_id: "driver1" };
    DriverLocation.findOneAndUpdate.mockResolvedValue({});

    clientSocket.emit("driver_go_online", data);

    setTimeout(() => {
      expect(DriverLocation.findOneAndUpdate).toHaveBeenCalledWith(
        { driver_id: "driver1" },
        expect.objectContaining({ driver_status: "online" }),
        expect.anything()
      );
      done();
    }, 100);
  });

  test("join_admin_room: should fail for non-admin user", (done) => {
    const data = { user_id: "user1" };
    User.findById.mockResolvedValue({ _id: "user1", role: "entrepreneur" });

    clientSocket.emit("join_admin_room", data);

    clientSocket.on("join_error", (res) => {
      expect(res.message).toBe("Unauthorized admin access");
      done();
    });
  });

  test("join_admin_room: should succeed for admin user", (done) => {
    const data = { user_id: "admin1" };
    User.findById.mockResolvedValue({ _id: "admin1", role: "admin" });

    clientSocket.emit("join_admin_room", data);

    clientSocket.on("join_success", (res) => {
      expect(res.message).toBe("Joined admins room");
      done();
    });
  });

  test("driver_live_location: should broadcast location and save to DB", (done) => {
    const data = {
      driver_id: "driver1",
      lat: 6.9,
      lng: 79.9,
      active_order_ids: ["order1"],
      driver_status: "online"
    };

    DriverLocation.findOneAndUpdate.mockResolvedValue({});
    
    // We need another client to listen for the broadcast
    const adminClient = new Client(`http://localhost:${port}`);
    adminClient.on("connect", () => {
        User.findById.mockResolvedValue({ _id: "admin1", role: "admin" });
        adminClient.emit("join_admin_room", { user_id: "admin1" });
        
        adminClient.on("admin_driver_location_update", (update) => {
            expect(update.driver_id).toBe("driver1");
            expect(update.lat).toBe(6.9);
            adminClient.close();
            done();
        });

        setTimeout(() => {
            clientSocket.emit("driver_live_location", data);
        }, 50);
    });
  });
});
