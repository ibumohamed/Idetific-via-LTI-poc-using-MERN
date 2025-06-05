import mongoose from "mongoose";


 // Constants for chunk management
const MAX_DOC_SIZE = 15 * 1024 * 1024; // 15MB (safe margin below 16MB)
const CHUNK_SIZE = 14 * 1024 * 1024; // Optimal chunk size 

const MarkStmntSchema = new mongoose.Schema({
  InId: { type: String, required: true }, // Instituion ID
  data: [], // Holds generated mark statement
  CrAt: { type: Date,default: Date.now,expires:60}, // Created At
  CrBy: { type: String }, // Created By
  StFl: { type: String, default: "A" }, // Status (C-Completed, P-Pending, E=Error)
  errMsg: {}, // Holds Error message
  reqObj: {}, // Holds request object

  isHeader: { type: Boolean, default: false },
  chunkData: { type: String },
  groupId: { type: mongoose.Schema.Types.ObjectId },
  chunkIndex: { type: Number },
  totalChunks: { type: Number }
});

// const MrkStmntModel = mongoose.model("markstmnt", MarkStmntSchema);
// module.exports = { MrkStmnt: MrkStmntModel };


// Pre-save hook for automatic chunking
MarkStmntSchema.pre('save', async function(next) {
    try {
  console.log('test.js (LineCode 31) ', );
        // Skip chunking for non-header documents
        if (!this.isHeader) return next();
        
        // Skip chunking if under size limit
        const docSize = Buffer.byteLength(JSON.stringify(this));
        console.log('test.js (LineCode 37) ', docSize);
        if (docSize <= MAX_DOC_SIZE) return next();

        // Convert data to JSON string
        const jsonData = JSON.stringify(this.data);
        const jsonDataLength = jsonData.length;
        // Split into optimal chunks
        const chunkPromises = [];
        const chunkModel = mongoose.model("test");
        for (let i = 0; i < jsonDataLength; i += CHUNK_SIZE) {
        const chunkDoc = new chunkModel({
            InId: this.InId,
            CrAt: this.CrAt,
            CrBy: this.CrBy,
        chunkData: jsonData.slice(i, i + CHUNK_SIZE),
        groupId:this._id,
        chunkIndex:(i/CHUNK_SIZE),
        data: [],
        errMsg: {},
        reqObj: {},
        });
        chunkPromises.push(chunkDoc.save());
        }
        console.log('test.js (LineCode 61) ',chunkPromises.length);
        await Promise.all(chunkPromises);
        this.data = [];
        this.totalChunks = chunkPromises.length 
        next();
    } catch (err) {
        console.log('test.js (LineCode 61) err', err);
        next(err);
    }
});






export default mongoose.model("test", MarkStmntSchema);
