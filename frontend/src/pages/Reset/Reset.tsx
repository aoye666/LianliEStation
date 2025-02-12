import Navbar from '../../components/Navbar/Navbar';
import './Reset.scss'
import { useParams, Navigate } from 'react-router-dom'
import Forget from '../../pages/Forget/Forget';

const Reset = () => {
  const { type } = useParams();//nickname campus_id qq_id avatar theme_id background banner
  switch (type) {
    case 'nickname':
      return <div className='reset-container'>
        <Navbar title='重置昵称' backActive={true} backPath='settings'/>
      </div>
    case 'campus_id':
      return <div className='reset-container'>
        <Navbar title='重置默认校区' backActive={true} backPath='settings'/>
      </div>
    case 'qq_id':
      return <div className='reset-container'>
        <Navbar title='重置绑定QQ' backActive={true} backPath='settings'/>
      </div>
    case 'avatar':
      return <div className='reset-container'>
        <Navbar title='重置头像' backActive={true} backPath='settings'/>
      </div>
    case 'theme_id':
      return <div className='reset-container'>
        <Navbar title='重置主题风格' backActive={true} backPath='settings'/>
      </div>
    case 'background':
      return <div className='reset-container'>
        <Navbar title='重置发布页背景' backActive={true} backPath='settings'/>
      </div>
    case 'banner':
      return <div className='reset-container'>
        <Navbar title='重置资料卡背景' backActive={true} backPath='settings'/>
      </div>
    case 'password':
      return <Forget />
    default:
      return <Navigate to='/user/settings' replace />
  }
}

export default Reset
