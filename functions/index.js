const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ฟังก์ชันที่ทำงานทุก 5 นาที
exports.deleteUnverifiedUsers = functions.pubsub
    .schedule("every 5 minutes")
    .timeZone("Asia/Bangkok") // ตั้งเป็น timezone ของคุณ
    .onRun(async (context) => {
      const now = Date.now();
      const cutoffTime = now - (10 * 60 * 1000); // 10 นาทีที่แล้ว

      console.log("Starting cleanup of unverified users...");
      console.log("Current time:", new Date(now).toISOString());
      console.log("Cutoff time:", new Date(cutoffTime).toISOString());

      try {
        const listUsersResult = await admin.auth().listUsers();
        console.log(`Total users found: ${listUsersResult.users.length}`);

        const usersToDelete = [];

        for (const userRecord of listUsersResult.users) {
          const creationTime = new Date(userRecord.metadata.creationTime)
              .getTime();
          const isExpired = creationTime < cutoffTime;
          const isUnverified = !userRecord.emailVerified;

          console.log(`User: ${userRecord.email}`);
          console.log(`  - Created: ${userRecord.metadata.creationTime}`);
          console.log(`  - Email verified: ${userRecord.emailVerified}`);
          console.log(`  - Is expired: ${isExpired}`);
          console.log(`  - Should delete: ${isUnverified && isExpired}`);

          if (isUnverified && isExpired) {
            usersToDelete.push(userRecord);
          }
        }

        console.log(`Found ${usersToDelete.length} users to delete`);

        // ลบ users ที่ไม่ verify และหมดเวลาแล้ว
        const deletePromises = usersToDelete.map(async (user) => {
          try {
            await admin.auth().deleteUser(user.uid);
            console.log(`✅ Deleted unverified user: ${user.email} ` +
                `(UID: ${user.uid})`);
            return {success: true, email: user.email};
          } catch (error) {
            console.error(`❌ Failed to delete user ${user.email}:`, error);
            return {
              success: false,
              email: user.email,
              error: error.message,
            };
          }
        });

        const results = await Promise.all(deletePromises);
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        console.log(`✅ Successfully deleted: ${successCount} users`);
        console.log(`❌ Failed to delete: ${failCount} users`);

        return {
          success: true,
          totalProcessed: usersToDelete.length,
          successfullyDeleted: successCount,
          failedToDelete: failCount,
          timestamp: new Date(now).toISOString(),
        };
      } catch (error) {
        console.error("❌ Error in deleteUnverifiedUsers function:", error);
        throw new Error(`Function failed: ${error.message}`);
      }
    });

// ฟังก์ชันทดสอบสำหรับ manual trigger (เรียกได้ผ่าน HTTP)
exports.testDeleteUnverifiedUsers = functions.https
    .onRequest(async (req, res) => {
      try {
        const result = await exports.deleteUnverifiedUsers.run();
        res.status(200).json({
          message: "Function executed successfully",
          result: result,
        });
      } catch (error) {
        console.error("Error in test function:", error);
        res.status(500).json({
          error: "Function failed",
          message: error.message,
        });
      }
    });

// ฟังก์ชันตรวจสอบสถานะ users ทั้งหมด (สำหรับ debug)
exports.listAllUsers = functions.https.onRequest(async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const now = Date.now();
    const cutoffTime = now - (10 * 60 * 1000);

    const userInfo = listUsersResult.users.map((user) => {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      return {
        email: user.email,
        uid: user.uid,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
        createdTimestamp: creationTime,
        isExpired: creationTime < cutoffTime,
        shouldDelete: !user.emailVerified && creationTime < cutoffTime,
      };
    });

    res.status(200).json({
      totalUsers: userInfo.length,
      currentTime: new Date(now).toISOString(),
      cutoffTime: new Date(cutoffTime).toISOString(),
      users: userInfo,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({error: error.message});
  }
});
