/**
 * Calculates the final delivery price based on distance, package size, and vehicle rules.
 * Formula: Total = (Base Fare + (Distance * Rate)) * Package Multiplier
 */
const calculateFare = (distance, packageSize, rule) => {
    const { base_fare, per_km_rate, small_multiplier, medium_multiplier, large_multiplier, driver_cut_percent, platform_cut_percent } = rule;

    // 1. Calculate base cost by distance
    const subTotal = base_fare + (distance * per_km_rate);

    // 2. Determine multiplier based on package size
    let multiplier = 1.0;
    if (packageSize === 'small') multiplier = small_multiplier;
    else if (packageSize === 'medium') multiplier = medium_multiplier;
    else if (packageSize === 'large') multiplier = large_multiplier;

    // 3. Calculate Final Total
    const totalCost = subTotal * multiplier;

    // 4. Calculate Split
    const driverEarnings = (totalCost * driver_cut_percent) / 100;
    const platformEarnings = (totalCost * platform_cut_percent) / 100;

    return {
        distance_km: distance,
        total_cost: totalCost.toFixed(2),
        driver_earnings: driverEarnings.toFixed(2),
        platform_earnings: platformEarnings.toFixed(2)
    };
};

module.exports = { calculateFare };