const deliveryController = require("../../src/controllers/deliveryController");
const Order = require("../../src/models/deliveryModel");
const axios = require("axios");

jest.mock("../../src/models/deliveryModel");
jest.mock("axios");

describe("Entrepreneur Delivery Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: "entrepreneur_123", role: "entrepreneur" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createDelivery", () => {
    it("should create a new delivery successfully", async () => {
      req.body = {
        pickup_address: "Pickup Place",
        pickup_lat: 6.9,
        pickup_lng: 79.8,
        dropoff_address: "Dropoff Place",
        dropoff_lat: 6.95,
        dropoff_lng: 79.85,
        package_size: "small",
        vehicle_type: "bike",
        receiver_name: "John Doe",
        receiver_phone: "123456789",
        receiver_email: "john@example.com"
      };

      axios.get.mockResolvedValue({
        data: {
          routes: [{ distance: 5000 }] // 5km
        }
      });

      const mockSavedOrder = { ...req.body, _id: "order_id_123", status: "available" };
      Order.prototype.save = jest.fn().mockResolvedValue(mockSavedOrder);

      await deliveryController.createDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "available",
        _id: "order_id_123"
      }));
    });

    it("should return 400 if route calculation fails", async () => {
      axios.get.mockResolvedValue({ data: { routes: [] } });
      await deliveryController.createDelivery(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Could not calculate a valid road route." });
    });
  });

  describe("getMyDeliveries", () => {
    it("should fetch all deliveries for the logged-in entrepreneur", async () => {
      const mockOrders = [
        { _id: "1", order_id: "ODR-1", status: "available" },
        { _id: "2", order_id: "ODR-2", status: "delivered" }
      ];
      
      Order.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders)
      });

      await deliveryController.getMyDeliveries(req, res);

      expect(Order.find).toHaveBeenCalledWith({ user_id: "entrepreneur_123" });
      expect(res.json).toHaveBeenCalledWith({ orders: mockOrders });
    });
  });

  describe("updateDelivery", () => {
    it("should update an existing delivery", async () => {
      req.params.id = "order_123";
      req.body = { receiver_name: "Jane Doe" };
      
      Order.findByIdAndUpdate.mockResolvedValue({ ...req.body, _id: "order_123" });

      await deliveryController.updateDelivery(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith("order_123", req.body, { new: true });
      expect(res.json).toHaveBeenCalled();
    });
  });
});