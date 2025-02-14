import Navbar from '../../components/Navbar/Navbar';
import './Reset.scss'
import { useParams, Navigate } from 'react-router-dom'
import { useUserStore } from '../../store'
import { useState } from 'react';
import Forget from '../../pages/Forget/Forget';

interface Profile {
  nickname: string;
  campus_id: number;
  qq_id: string;
  avatar: string;
  theme_id: number;
  background: string;
  banner: string;
}

const Reset = () => {
  const [profile, setProfile] = useState<Profile|null>(null);
  const { type } = useParams();//nickname campus_id qq_id avatar theme_id background banner
  const currentUser = useUserStore((state) => state.currentUser);
  // console.log(currentUser);
  switch (type) {
    case 'nickname':
      return <div className='reset-container'>
        <Navbar title='重置昵称' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入新的昵称' onChange={(e) => {
          console.log(e.target.value)
        }} />
        <button className='text-submit' onClick={() => {
          console.log('提交')
        }}>保存</button>
      </div>
    case 'campus_id':
      return <div className='reset-container'>
        <Navbar title='重置默认校区' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入默认校区' onChange={(e) => {
          console.log(e.target.value)
        }} />
        <button className='text-submit' onClick={() => {
          console.log('提交')
        }}>保存</button>
      </div>
    case 'qq_id':
      return <div className='reset-container'>
        <Navbar title='重置绑定QQ' backActive={true} backPath='settings'/>
        <input className='reset-text' type='text' placeholder='请输入要绑定的QQ号' onChange={(e) => {
          console.log(e.target.value)
        }} />
        <button className='text-submit' onClick={() => {
          console.log('提交')
        }}>保存</button>
      </div>
    case 'avatar':
      return <div className='reset-container'>
        <Navbar title='重置头像' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'theme_id':
      return <div className='reset-container'>
        <Navbar title='重置主题风格' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'background':
      return <div className='reset-container'>
        <Navbar title='重置发布页背景' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'banner':
      return <div className='reset-container'>
        <Navbar title='重置资料卡背景' backActive={true} backPath='settings'/>
        <div style={{marginTop: '60px'}}>功能开发中...</div>
      </div>
    case 'password':
      return <Forget />
    default:
      return <Navigate to='/user/settings' replace />
  }
}

export default Reset
