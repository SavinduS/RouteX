// routes/inquiryRoutes.js
router.post('/', auth, async (req, res) => {
    try {
        const { subject, message } = req.body;
        // මෙහිදී Inquiry නමින් Model එකක් සාදා Database එකට save කරන්න
        // හෝ Admin ට Email එකක් යන ලෙස සකසන්න
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});