const driverController = require("../../src/controllers/driverController");
const DriverLocation = require("../../src/models/DriverLocation");
const Order = require("../../src/models/deliveryModel");
const DeliveryHistory = require("../../src/models/DeliveryHistory");
const BusinessRule = require("../../src/models/BusinessRule");
const User = require("../../src/models/User");
const sendEmail = require("../../src/utils/sendEmail");

jest.mock("../../src/models/DriverLocation");
jest.mock("../../src/models/deliveryModel");
jest.mock("../../src/models/DeliveryHistory");
jest.mock("../../src/models/BusinessRule");
jest.mock("../../src/models/User");
jest.mock("../../src/utils/sendEmail");

describe("Driver Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      user: { id: "driver_id_123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("updateLocation", () => {
    it("should update driver location and return 200", async () => {
      req.body = {
        driver_id: "driver_id_123",
        lat: 6.9271,
        lng: 79.8612,
        driver_status: "online",
      };
      const mockLocation = { ...req.body, recorded_at: new Date() };
      DriverLocation.findOneAndUpdate.mockResolvedValue(mockLocation);

      await driverController.updateLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Location updated",
        data: mockLocation,
      });
    });

    it("should return 500 on error", async () => {
      DriverLocation.findOneAndUpdate.mockRejectedValue(new Error("DB Error"));
      await driverController.updateLocation(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAvailableOrders", () => {
    it("should fetch available orders and return 200", async () => {
      req.query = { vehicle_type: "bike" };
      const mockOrders = [{ _id: "order1", status: "available" }];
      Order.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      await driverController.getAvailableOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockOrders,
      });
    });
  });

  describe("getActiveOrders", () => {
    it("should fetch active orders for a driver", async () => {
      const mockOrders = [{ _id: "order1", status: "assigned" }];
      Order.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      await driverController.getActiveOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockOrders,
      });
    });
  });

  describe("acceptOrder", () => {
    it("should accept an available order", async () => {
      req.body = { order_id: "order1", driver_id: "driver_id_123" };
      const mockOrder = { _id: "order1", status: "assigned", driver_id: "driver_id_123" };
      Order.findOneAndUpdate.mockResolvedValue(mockOrder);
      DriverLocation.findOneAndUpdate.mockResolvedValue({});

      await driverController.acceptOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Order accepted successfully",
        data: mockOrder,
      });
    });

    it("should return 400 if order is already taken", async () => {
      req.body = { order_id: "order1", driver_id: "driver_id_123" };
      Order.findOneAndUpdate.mockResolvedValue(null);

      await driverController.acceptOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status to picked_up", async () => {
      req.body = { order_id: "order1", status: "picked_up" };
      const mockOrder = { _id: "order1", status: "picked_up", receiver_email: "test@test.com" };
      Order.findByIdAndUpdate.mockResolvedValue(mockOrder);

      await driverController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Status updated to picked_up",
        data: mockOrder,
      });
    });

    it("should complete order when status is delivered", async () => {
      req.body = { order_id: "order1", status: "delivered" };
      const mockOrder = {
        _id: "order1",
        order_id: "ODR123",
        user_id: "user1",
        driver_id: "driver1",
        vehicle_type: "bike",
        total_cost: 1000,
      };
      const mockRule = { driver_cut_percent: 80, platform_cut_percent: 20 };
      const mockUser = { _id: "user1", email: "user@test.com", full_name: "User One" };

      Order.findById.mockResolvedValue(mockOrder);
      BusinessRule.findOne.mockResolvedValue(mockRule);
      User.findById.mockResolvedValue(mockUser);
      DeliveryHistory.prototype.save = jest.fn().mockResolvedValue({});
      DriverLocation.findOneAndUpdate.mockResolvedValue({});
      DriverLocation.findOne.mockResolvedValue({ driver_id: "driver1", active_order_ids: [], save: jest.fn() });
      Order.findByIdAndDelete.mockResolvedValue({});

      await driverController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(DeliveryHistory).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
