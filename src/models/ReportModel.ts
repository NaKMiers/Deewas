import mongoose from 'mongoose'
const Schema = mongoose.Schema

const ReportSchema = new Schema(
  {
    results: [
      {
        question: { type: String, required: true },
        answer: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
)

const ReportModel = mongoose.models.report || mongoose.model('report', ReportSchema)
export default ReportModel

export interface IReport {
  _id: string
  createdAt: string
  updatedAt: string

  results: IReportResult[]
}

export interface IReportResult {
  question: string
  answer: string | string[]
}
export type IFullReport = IReport
