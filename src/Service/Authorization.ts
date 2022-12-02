import quip from "quip-apps-api";
import { v4 as uuidv4 } from 'uuid';


export default class Authorization {

  public static getRefreshToken = async (refresh=false) => {
    const rootRecord = quip.apps.getRootRecord()
    let isPolling = true;
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        isPolling = false
        resolve(false)
      }, 120000)
    })
    const refreshPromise = new Promise((resolve, reject) => {
      if (rootRecord.get('refreshToken') && !refresh) {
        return resolve(true)
      }
      const uuid = uuidv4()
      quip.apps.openLink(`https://login.salesforce.com/services/oauth2/authorize?state=${uuid}&client_id=3MVG9pRzvMkjMb6nDBJ.IhM.V_olDKUnV6GAoMS6fF65UgMt7arUZ36zzkO8r1JXDiKi.pvhq4FSjV2uHndIp&redirect_uri=https://asia-northeast1-rqa-backend.cloudfunctions.net/salesforceService-oauth2&response_type=code`)
      async function polling() {
        const res = await fetch(`https://asia-northeast1-rqa-backend.cloudfunctions.net/salesforceService-refreshToken?state=${uuid}`)
        const { error, refresh_token } = await res.json()
        if (!error && !refresh_token && isPolling) {
          setTimeout(polling, 1000)
          return
        }
        if (refresh_token) {
          rootRecord.set('refreshToken', refresh_token)
          resolve(true)
        }
        resolve(false)
      }
      setTimeout(async () => {
        polling()
      }, 3000)
    })
    return Promise.race([timeoutPromise, refreshPromise])
  }
  public static getAccessToken = async (refresh = false, retry = true):Promise<any> => {
    const rootRecord = quip.apps.getRootRecord()
    if (rootRecord.get('accessToken') && !refresh) {
      return { access_token: rootRecord.get('accessToken'), salesforce_url: rootRecord.get('salesforceUrl')}
    }
    var bodyFormData = new FormData();
    bodyFormData.append('grant_type', 'refresh_token');
    bodyFormData.append('client_id', '3MVG9pRzvMkjMb6nDBJ.IhM.V_olDKUnV6GAoMS6fF65UgMt7arUZ36zzkO8r1JXDiKi.pvhq4FSjV2uHndIp');
    bodyFormData.append('client_secret', 'C321CE9EA7F0658A93C33EFECC3D70E86CEC671603F359013866FE4AA2FB5711');
    bodyFormData.append('refresh_token', rootRecord.get('refreshToken') || "");
    try {
      const res = await fetch('https://asia-northeast1-rqa-backend.cloudfunctions.net/cors-corsProxy?url=https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        body: bodyFormData
      })
      const data = await res.json()
      const { access_token, error, error_description, instance_url, id } = data
      if (error) {
        throw(error_description)
      }
      rootRecord.set('accessToken', access_token)
      rootRecord.set('salesforceUrl', instance_url)
      rootRecord.set('salesforceId', id.split('/')[id.split('/').length - 1])
      return { access_token, salesforce_url: instance_url}
    }
    catch (e) {
      const getRefreshTokenResult = await this.getRefreshToken(true)
      if(getRefreshTokenResult && retry){
        return await this.getAccessToken(true, false)
      }
      return { 'error': e }
    }
  }
}
