import quip from 'quip-apps-api'
import React, { useEffect } from 'react'
import { RootEntity } from '../model/root'
import SalesforceApi from '../Service/SalesforceApi'
const WEEKDAYS = ['SUN', 'MON','TUE','WED','THU','FRI','SAT']
export default function SalesforceSync() {
    let interval: NodeJS.Timer
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    
    useEffect(()=>{
        // timer()
        // sync()
        return ()=>{
            clearInterval(interval)
        }
    }, [])
    const createSnapshot = (views:any)=>{
        return views.reduce((obj:any, curr:any)=>{
            return {
                ...obj,
                [curr.userId]:curr.lastViewDate
            }
        },{})
    }
    const sync = async ()=>{
        const views = rootRecord.getData().allViews.map(record=>record.getData())
        if(!views.length) return
        const snapshot = rootRecord.get('snapshot') || {}
        const willUpdateViews = views.filter(record=>snapshot[record.userId] !== record.lastViewDate)
        let postData:any = []
        const {records:userMasterRecords} = await SalesforceApi.queryRecords({
            queryString:'select+id,Name,Quip_User_ID__c,User__c,Contact__c+from+Quip_Access_User_Master__c'
        })
        willUpdateViews.map(async (obj, index)=>{
            let id
            const currentQuipMasterUser = userMasterRecords.find((record:any)=>record.Quip_User_ID__c === obj.userId)
            if(!currentQuipMasterUser){
                const data = await SalesforceApi.addRecord({
                    sObject:'Quip_Access_User_Master__c',
                    data:{
                        Name: obj.userName,
                        Quip_User_ID__c:obj.userId
                    }
                })
                id = data.id
            } else {
                id = currentQuipMasterUser.Id
            }
            postData.push({
                attributes : {type : "Quip_Access_Log__c"},
                Quip_User_Name__c: id,
                User__c: currentQuipMasterUser?.User__c,
                Contact__c: currentQuipMasterUser?.Contact__c,
                Access_Time__c: new Date(obj.lastViewDate),
                Access_Day__c: WEEKDAYS[new Date(obj.lastViewDate).getDay()],
                Document_ID__c: rootRecord.get('threadId'),
                Document_URL__c: `https://quip.com/${rootRecord.get('threadId') || ''}`
            })
            
        })
        
        //update records without user and contact
        const updatedLookupRecords = userMasterRecords.filter((record:any)=>!!record.User__c || !!record.Contact__c)
        let updateRequest
        if(updatedLookupRecords.length){
            const updatedLookupRecordsReduce:any = {}
            const updatedLookupString = updatedLookupRecords.reduce((str:string, curr:any, index:number)=>{
                updatedLookupRecordsReduce[curr.Id] = curr
                if(index!==updatedLookupRecords.length-1){
                    return str + `Quip_User_Name__c+=+'${curr.Id}'or`
                }
                return str + `Quip_User_Name__c+=+'${curr.Id}'`   
            },"")
            const {records:needUpdateRecords} = await SalesforceApi.queryRecords({
                queryString:`select+id,Quip_User_Name__c,Name,User__c,Contact__c+from+Quip_Access_Log__c+where+(User__c+=+null+and+Contact__c+=+null) and (${updatedLookupString})`
            })
            if(needUpdateRecords.length){
                updateRequest = {
                    method : "PATCH",
                    url : "/services/data/v55.0/composite/sobjects",
                    referenceId : "refUpdate",
                    body : {
                        records:needUpdateRecords.map((record:any)=>{
                            return {
                                attributes : {type : "Quip_Access_Log__c"},
                                id: record.Id,
                                User__c: updatedLookupRecordsReduce[record.Quip_User_Name__c]?.User__c,
                                Contact__c: updatedLookupRecordsReduce[record.Quip_User_Name__c]?.Contact__c,
                            }
                        })
                    }
                }
            }
        }
        const addRequest = {
            method : "POST",
            url : "/services/data/v55.0/composite/sobjects",
            referenceId : "refAdd",
            body : {
                records: postData
            }
        }
        const response = await SalesforceApi.compositeRequest({
            data: {
                compositeRequest: updateRequest?[updateRequest, addRequest]:[addRequest]
            }
        })
        if(!response.hasErrors){
            rootRecord.set('snapshot', createSnapshot(views))
        }
    }
    const timer = async ()=>{
        interval = setInterval(async ()=>{
            if(!rootRecord.get('salesforceUrl')){
                return
            }
            if(!rootRecord.get('syncing') && Date.now()>rootRecord.get('nextSync')){
                rootRecord.set('syncing', true)
                await sync()
                rootRecord.set('nextSync', nextHour())
                rootRecord.set('syncing', false)
            }
        }, 5000)

    }
    const nextHour = (offset = 1)=>{
        let d = new Date();
        d.setHours(d.getHours()+offset)
        d.setMinutes(0,0,0);
        return d.getTime()
    }
  return (
    <></>
  )
}
