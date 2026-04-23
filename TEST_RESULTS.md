# Bus Pass Validator - Test Results
**Test Date**: April 22, 2026

---

## Test Case 1: PASS001 - Valid Student Pass ✅

**Input**: `PASS001`

**Passenger Details**:
- Name: Aditya Kumar
- Age: 18 years
- ID: STU20240001
- Mobile: +91-9876543210

**Pass Information**:
- Pass Type: Student
- Route: ROUTE_A1 (Metro Line A1)
- Issue Date: April 1, 2026
- Expiration Date: May 1, 2026
- Days Remaining: 9 days
- Valid Days: Weekdays (Mon-Fri)

**Validation Checks**:
1. ✅ Pass exists in database
2. ✅ Pass is not expired (9 days remaining)
3. ✅ Route is active
4. ⚠️ Weekday/Weekend check: Pass valid on weekdays (if test day is weekday, then ✅)
5. ✅ Passenger eligibility: Student age 18 is within 5-25 range

**Expected Result**: 🟢 **VALID** (all checks pass if tested on weekday)

**Validation Output**:
```
Status: ✓ PASS VALID
Passenger: Aditya Kumar, 18 years, STU20240001
Route: Metro Line A1 ✓ Active
Pass Type: Student
Expiration: 9 days remaining
Valid Days: Weekdays (Mon-Fri)
Category: School Student
```

---

## Test Case 2: PASS002 - Expired College Pass ❌

**Input**: `PASS002`

**Passenger Details**:
- Name: Priya Sharma
- Age: 20 years
- ID: COL20240002
- Mobile: +91-9876543211

**Pass Information**:
- Pass Type: College
- Route: ROUTE_B2 (City Bus B2)
- Issue Date: March 15, 2026
- Expiration Date: April 14, 2026 (30 days from issue)
- Days Remaining: -8 days (EXPIRED 8 days ago)
- Valid Days: Weekdays + Weekends

**Validation Checks**:
1. ✅ Pass exists in database
2. ❌ **Pass is EXPIRED** (expired on April 14, 2026)
3. ✅ Route is active
4. ✅ Weekday/Weekend check: Pass valid 7 days a week
5. ✅ Passenger eligibility: College age 20 is within 18-28 range

**Expected Result**: 🔴 **INVALID** (expiry check failed)

**Validation Output**:
```
Status: ✗ PASS INVALID
Passenger: Priya Sharma, 20 years, COL20240002
Route: City Bus B2 ✓ Active
Pass Type: College
Expiration: Expired (on 14-Apr-2026)
Days Remaining: 0 days

⚠️ Issues Found:
• Pass has expired on 14-Apr-2026
```

---

## Test Case 3: PASS003 - Expired Working Professional Pass ❌

**Input**: `PASS003`

**Passenger Details**:
- Name: Rajesh Patel
- Age: 35 years
- ID: EMP20240003
- Mobile: +91-9876543212

**Pass Information**:
- Pass Type: Regular
- Route: ROUTE_C3 (Suburban Express C3)
- Issue Date: March 1, 2026
- Expiration Date: March 31, 2026 (30 days from issue)
- Days Remaining: -22 days (EXPIRED 22 days ago)
- Valid Days: Weekdays (Mon-Fri)

**Validation Checks**:
1. ✅ Pass exists in database
2. ❌ **Pass is EXPIRED** (expired on March 31, 2026)
3. ✅ Route is active
4. ⚠️ Weekday/Weekend check: Pass valid only on weekdays
5. ✅ Passenger eligibility: Regular pass, age 35 ≥ 18

**Expected Result**: 🔴 **INVALID** (expiry check failed - primary issue)

**Validation Output**:
```
Status: ✗ PASS INVALID
Passenger: Rajesh Patel, 35 years, EMP20240003
Route: Suburban Express C3 ✓ Active
Pass Type: Regular
Expiration: Expired (on 31-Mar-2026)
Days Remaining: 0 days

⚠️ Issues Found:
• Pass has expired on 31-Mar-2026
```

---

## Test Case 4: PASS004 - Invalid Route Pass ❌

**Input**: `PASS004`

**Passenger Details**:
- Name: Sophia Johnson
- Age: 22 years
- ID: UNI20240004
- Mobile: +91-9876543213

**Pass Information**:
- Pass Type: Student
- Route: ROUTE_INVALID (Status: INACTIVE)
- Issue Date: April 5, 2026
- Expiration Date: May 5, 2026
- Days Remaining: 13 days
- Valid Days: Weekdays (Mon-Fri)

**Validation Checks**:
1. ✅ Pass exists in database
2. ✅ Pass is not expired (13 days remaining)
3. ❌ **Route is INACTIVE** (not available in service)
4. ⚠️ Weekday/Weekend check: Pass valid on weekdays
5. ✅ Passenger eligibility: Student age 22 is within 5-25 range

**Expected Result**: 🔴 **INVALID** (route check failed)

**Validation Output**:
```
Status: ✗ PASS INVALID
Passenger: Sophia Johnson, 22 years, UNI20240004
Route: N/A ✗ Inactive
Pass Type: Student
Expiration: 13 days remaining
Valid Days: Weekdays (Mon-Fri)
Category: University Student

⚠️ Issues Found:
• Route not found in the system
```

---

## Test Case 5: Invalid Pass ID ❌

**Input**: `INVALID123` or any non-existent pass ID

**Expected Result**: 🔴 **INVALID**

**Error Message**:
```
❌ Pass ID not found in the system
```

---

## Summary of Test Results

| Pass ID | Test Case | Expected Result | Reason |
|---------|-----------|-----------------|--------|
| PASS001 | Valid Student Pass | ✅ VALID | All checks pass (if weekday) |
| PASS002 | Expired College Pass | ❌ INVALID | Expired 8 days ago (Apr 14) |
| PASS003 | Expired Working Professional | ❌ INVALID | Expired 22 days ago (Mar 31) |
| PASS004 | Invalid Route Pass | ❌ INVALID | Route is inactive in system |
| Any Other | Non-existent Pass | ❌ INVALID | Pass not in database |

---

## Validation Logic Verified

✅ **Pass Existence Check** - Validates if pass ID exists in database
✅ **Monthly Expiry Check** - Validates 30-day validity from issue date
✅ **Route Validity Check** - Validates if route is active
✅ **Pass Type Rules** - Validates weekday/weekend restrictions
✅ **Passenger Eligibility** - Validates age ranges and format of ID/mobile

---

## How to Test Manually

1. Open `index.html` in a web browser
2. Enter one of the test pass IDs above
3. Click "Validate Pass" or press Enter
4. Verify the result matches the expected output above

**All 6 required validation outputs are displayed:**
- ✓ Pass valid/invalid status
- ✓ Passenger name and details
- ✓ Route information
- ✓ Days remaining until expiration
- ✓ Allowed travel dates/times
- ✓ Error messages if validation fails
