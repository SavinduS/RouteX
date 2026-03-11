const { calculateFare } = require('../../src/utils/pricingLogic');

describe('Admin Unit Testing: Pricing Logic', () => {
    
    const mockRule = {
        base_fare: 100,
        per_km_rate: 50,
        small_multiplier: 1.0,
        medium_multiplier: 1.2,
        large_multiplier: 1.5,
        driver_cut_percent: 80,
        platform_cut_percent: 20
    };

    test('Should calculate correct cost for a small package (1.0x)', () => {
        const distance = 10;
        const result = calculateFare(distance, 'small', mockRule);
        
        // (100 + (10 * 50)) * 1.0 = 600
        expect(result.total_cost).toBe("600.00");
        expect(result.driver_earnings).toBe("480.00"); // 80% of 600
        expect(result.platform_earnings).toBe("120.00"); // 20% of 600
    });

    test('Should apply Medium multiplier (1.2x) correctly', () => {
        const distance = 10;
        const result = calculateFare(distance, 'medium', mockRule);
        
        // (100 + (10 * 50)) * 1.2 = 600 * 1.2 = 720
        expect(result.total_cost).toBe("720.00");
    });

    test('Should apply Large multiplier (1.5x) correctly', () => {
        const distance = 10;
        const result = calculateFare(distance, 'large', mockRule);
        
        // (100 + (10 * 50)) * 1.5 = 600 * 1.5 = 900
        expect(result.total_cost).toBe("900.00");
    });

    test('Should handle zero distance correctly', () => {
        const result = calculateFare(0, 'small', mockRule);
        // (100 + (0 * 50)) * 1.0 = 100
        expect(result.total_cost).toBe("100.00");
    });
});